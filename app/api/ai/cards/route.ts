import { Buffer } from 'node:buffer';
import { env } from 'cloudflare:workers';
import { getDb } from '@/db';
import { materials, studySets } from '@/db/schema';

type CardDraft = { term: string; definition: string };

function localCards(text: string, count: number): CardDraft[] {
  const sentences = text
    .replace(/\r/g, '')
    .split(/(?:\n{2,}|(?<=[.!?])\s+)/)
    .map((line) => line.replace(/^[-•*\d.)\s]+/, '').trim())
    .filter((line) => line.length > 24)
    .slice(0, count);

  return sentences.map((sentence, index) => {
    const definition = sentence.match(/^(.{2,70}?)\s+(?:is|are|means|refers to|describes)\s+(.+)$/i);
    if (definition) return { term: definition[1].trim(), definition: definition[2].trim() };
    const colon = sentence.match(/^(.{2,60}?):\s+(.+)$/);
    if (colon) return { term: colon[1].trim(), definition: colon[2].trim() };
    return { term: `Key idea ${index + 1}`, definition: sentence };
  });
}

function responseText(payload: unknown): string {
  const value = payload as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (value.output_text) return value.output_text;
  return value.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text ?? '';
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const fileValue = form.get('file');
    const file = fileValue instanceof File ? fileValue : null;
    const pastedText = String(form.get('text') ?? '').trim();
    const requestedCount = Number(form.get('count') ?? 12);
    const count = Math.max(6, Math.min(24, Number.isFinite(requestedCount) ? requestedCount : 12));
    const suggestedTitle = String(form.get('title') ?? 'New study set').slice(0, 100);

    if (!file && !pastedText) return Response.json({ error: 'Add a file or paste some notes first.' }, { status: 400 });
    if (file && file.size > 8 * 1024 * 1024) return Response.json({ error: 'Please choose a file smaller than 8 MB.' }, { status: 413 });

    const fileBytes = file ? new Uint8Array(await file.arrayBuffer()) : null;
    const materialId = crypto.randomUUID();
    const setId = crypto.randomUUID();
    const objectKey = file ? `materials/${materialId}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}` : `materials/${materialId}/notes.txt`;
    const key = env.OPENAI_API_KEY;
    let draft: { title: string; subject: string; cards: CardDraft[] };

    if (key) {
      const content: Array<Record<string, string>> = [];
      if (file && fileBytes) {
        content.push({
          type: 'input_file',
          filename: file.name,
          file_data: `data:${file.type || 'application/octet-stream'};base64,${Buffer.from(fileBytes).toString('base64')}`,
        });
      }
      content.push({
        type: 'input_text',
        text: `${pastedText ? `STUDY MATERIAL:\n${pastedText.slice(0, 120000)}\n\n` : ''}Create ${count} concise, accurate flashcards from the supplied study material. Prioritize concepts a student is likely to be tested on. Mix definitions with cause/effect and application questions. Every card must stand alone, avoid duplicates, and use plain language. Suggested title: ${suggestedTitle}.`,
      });

      const aiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-5.4-mini',
          store: false,
          reasoning: { effort: 'low' },
          input: [{ role: 'user', content }],
          text: {
            format: {
              type: 'json_schema',
              name: 'study_set',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  subject: { type: 'string' },
                  cards: {
                    type: 'array',
                    minItems: 6,
                    maxItems: 24,
                    items: {
                      type: 'object',
                      properties: { term: { type: 'string' }, definition: { type: 'string' } },
                      required: ['term', 'definition'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['title', 'subject', 'cards'],
                additionalProperties: false,
              },
            },
          },
        }),
      });
      if (!aiResponse.ok) {
        const problem = await aiResponse.text();
        console.error('OpenAI response error', aiResponse.status, problem.slice(0, 500));
        return Response.json({ error: 'The AI could not read this material. Try a smaller file or paste the key sections.' }, { status: 502 });
      }
      const payload = await aiResponse.json();
      draft = JSON.parse(responseText(payload));
    } else {
      const readableText = pastedText || (file?.type.startsWith('text/') && fileBytes ? new TextDecoder().decode(fileBytes) : '');
      if (!readableText) return Response.json({ error: 'AI document reading is not connected yet. Paste the text from this file to create cards now.' }, { status: 503 });
      const generated = localCards(readableText, count);
      if (!generated.length) return Response.json({ error: 'Add a little more detail so quizbuddy has enough material to create cards.' }, { status: 400 });
      draft = { title: suggestedTitle || 'New study set', subject: 'Study notes', cards: generated };
    }

    const cards = draft.cards.slice(0, count).map((card) => ({ ...card, mastery: 0 }));
    const now = Date.now();
    try {
      if (file && fileBytes && env.FILES) await env.FILES.put(objectKey, fileBytes, { httpMetadata: { contentType: file.type || 'application/octet-stream' } });
      const db = getDb();
      await db.batch([
        db.insert(materials).values({ id: materialId, filename: file?.name ?? 'Pasted notes', contentType: file?.type ?? 'text/plain', objectKey, status: 'ready', createdAt: now }),
        db.insert(studySets).values({ id: setId, materialId, title: draft.title, subject: draft.subject, cardsJson: JSON.stringify(cards), createdAt: now }),
      ]);
    } catch (storageError) {
      console.warn('Study set created without persistent storage', storageError);
    }

    return Response.json({ set: { id: setId, title: draft.title, subject: draft.subject, cards, source: file?.name ?? 'Pasted notes' }, ai: Boolean(key) });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Something went wrong while creating the study set.' }, { status: 500 });
  }
}
