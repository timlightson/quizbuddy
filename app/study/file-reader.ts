const textDecoder = new TextDecoder();
const latinDecoder = new TextDecoder('latin1');

function uint32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

async function inflateRaw(bytes: Uint8Array) {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function decodeXml(xml: string) {
  const withBreaks = xml
    .replace(/<w:tab\s*\/>/g, '\t')
    .replace(/<w:br\s*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<\/w:tr>/g, '\n');
  const document = new DOMParser().parseFromString(
    withBreaks,
    'application/xml',
  );
  return (
    document.documentElement.textContent?.replace(/\n{3,}/g, '\n\n').trim() ??
    ''
  );
}

async function extractDocx(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocd = -1;
  for (
    let index = bytes.length - 22;
    index >= Math.max(0, bytes.length - 65557);
    index -= 1
  ) {
    if (uint32(view, index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) throw new Error('This DOCX file could not be opened.');
  const entries = view.getUint16(eocd + 10, true);
  let cursor = uint32(view, eocd + 16);
  const wanted = new Set([
    'word/document.xml',
    'word/footnotes.xml',
    'word/endnotes.xml',
  ]);
  const chunks: string[] = [];
  for (
    let entry = 0;
    entry < entries && cursor + 46 < bytes.length;
    entry += 1
  ) {
    if (uint32(view, cursor) !== 0x02014b50) break;
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = uint32(view, cursor + 20);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = uint32(view, cursor + 42);
    const name = textDecoder.decode(
      bytes.slice(cursor + 46, cursor + 46 + nameLength),
    );
    if (wanted.has(name) && uint32(view, localOffset) === 0x04034b50) {
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.slice(start, start + compressedSize);
      const content =
        method === 0
          ? compressed
          : method === 8
            ? await inflateRaw(compressed)
            : null;
      if (content) chunks.push(decodeXml(textDecoder.decode(content)));
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  const result = chunks.filter(Boolean).join('\n\n').trim();
  if (!result) throw new Error('No readable text was found in this DOCX file.');
  return result;
}

function decodePdfLiteral(value: string) {
  let output = '';
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character !== '\\') {
      output += character;
      continue;
    }
    const next = value[++index];
    if (next === undefined) break;
    const escapes: Record<string, string> = {
      n: '\n',
      r: '\r',
      t: '\t',
      b: '\b',
      f: '\f',
      '(': '(',
      ')': ')',
      '\\': '\\',
    };
    if (next in escapes) output += escapes[next];
    else if (/[0-7]/.test(next)) {
      let octal = next;
      while (octal.length < 3 && /[0-7]/.test(value[index + 1] ?? ''))
        octal += value[++index];
      output += String.fromCharCode(Number.parseInt(octal, 8));
    } else if (next !== '\n' && next !== '\r') output += next;
  }
  const bytes = Uint8Array.from(
    output,
    (character) => character.charCodeAt(0) & 255,
  );
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    let decoded = '';
    for (let index = 2; index + 1 < bytes.length; index += 2)
      decoded += String.fromCharCode((bytes[index] << 8) | bytes[index + 1]);
    return decoded;
  }
  return latinDecoder.decode(bytes);
}

function decodePdfHex(value: string) {
  const clean = value.replace(/\s+/g, '');
  const padded = clean.length % 2 ? `${clean}0` : clean;
  const bytes = new Uint8Array(padded.length / 2);
  for (let index = 0; index < padded.length; index += 2)
    bytes[index / 2] = Number.parseInt(padded.slice(index, index + 2), 16);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    let decoded = '';
    for (let index = 2; index + 1 < bytes.length; index += 2)
      decoded += String.fromCharCode((bytes[index] << 8) | bytes[index + 1]);
    return decoded;
  }
  return latinDecoder.decode(bytes);
}

function extractPdfOperators(content: string) {
  const blocks = content.match(/BT[\s\S]*?ET/g) ?? [content];
  const lines: string[] = [];
  for (const block of blocks) {
    const tokens: Array<{ index: number; text: string }> = [];
    const literal = /\(((?:\\.|[^\\)])*)\)\s*(?:Tj|'|")/g;
    const array = /\[((?:.|\n)*?)\]\s*TJ/g;
    const hex = /<([0-9a-fA-F\s]+)>\s*Tj/g;
    for (const match of block.matchAll(literal))
      tokens.push({ index: match.index, text: decodePdfLiteral(match[1]) });
    for (const match of block.matchAll(hex))
      tokens.push({ index: match.index, text: decodePdfHex(match[1]) });
    for (const match of block.matchAll(array)) {
      const pieces: string[] = [];
      for (const part of match[1].matchAll(
        /\(((?:\\.|[^\\)])*)\)|<([0-9a-fA-F\s]+)>/g,
      ))
        pieces.push(
          part[1] !== undefined
            ? decodePdfLiteral(part[1])
            : decodePdfHex(part[2]),
        );
      tokens.push({ index: match.index, text: pieces.join('') });
    }
    const line = tokens
      .sort((a, b) => a.index - b.index)
      .map((token) => token.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (line && /[a-z0-9]{2}/i.test(line)) lines.push(line);
  }
  return lines.join('\n');
}

async function extractPdf(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const raw = latinDecoder.decode(bytes);
  const chunks: string[] = [];
  const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  for (const match of raw.matchAll(streamPattern)) {
    const data = match[1];
    const start = match.index + match[0].indexOf(data);
    const dictionary = raw.slice(Math.max(0, match.index - 400), match.index);
    try {
      const content = dictionary.includes('/FlateDecode')
        ? latinDecoder.decode(
            await new Response(
              new Blob([bytes.slice(start, start + data.length)])
                .stream()
                .pipeThrough(new DecompressionStream('deflate')),
            ).arrayBuffer(),
          )
        : data;
      const text = extractPdfOperators(content);
      if (text) chunks.push(text);
    } catch {}
  }
  const result = chunks
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!result)
    throw new Error(
      'No readable text was found. Scanned or encrypted PDFs need OCR before importing.',
    );
  return result;
}

export async function extractFileText(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return extractPdf(await file.arrayBuffer());
  if (extension === 'docx') return extractDocx(await file.arrayBuffer());
  if (['txt', 'csv', 'tsv', 'md', 'json'].includes(extension ?? ''))
    return file.text();
  throw new Error('Use PDF, DOCX, TXT, CSV, TSV, Markdown, or JSON.');
}
