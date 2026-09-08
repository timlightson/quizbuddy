import type { AppSettings, Card, Mastery, StudySet, StudyStats } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  dailyGoal: 30,
  newCardsPerSession: 20,
  grading: 'normal',
  promptSide: 'term',
  sounds: true,
  readAloud: false,
  speechRate: 1,
};

export const DEFAULT_STATS: StudyStats = {
  reviews: 0,
  correct: 0,
  seconds: 0,
  streak: 0,
  xp: 0,
  activity: {},
};

const now = Date.now();

function cards(
  rows: Array<[string, string]>,
  masteries: Mastery[] = [],
): Card[] {
  return rows.map(([term, definition], index) => ({
    id: `seed-${term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    term,
    definition,
    starred: index === 1 || index === 5,
    mastery: masteries[index] ?? ((index % 5) as Mastery),
    correct: index % 4,
    wrong: index % 3 === 0 ? 1 : 0,
  }));
}

export const STARTER_SETS: StudySet[] = [
  {
    id: 'biology-cell',
    title: 'Biology — The Cell',
    subject: 'Biology',
    description:
      'Organelles, transport, and cellular energy for the unit exam.',
    termLanguage: 'English (US)',
    definitionLanguage: 'English (US)',
    source: 'Chapter 4 class notes',
    color: 'from-[#6d5dfc] via-[#3976d9] to-[#1ab8a3]',
    createdAt: now - 86400000 * 5,
    updatedAt: now,
    notes:
      'Cells are the basic unit of life. Eukaryotic cells contain membrane-bound organelles. The cell membrane regulates transport. Cellular respiration converts stored chemical energy into ATP.',
    cards: cards([
      [
        'Mitochondria',
        'Organelle that produces most usable cellular energy through respiration.',
      ],
      ['Ribosome', 'Structure that assembles amino acids into proteins.'],
      [
        'Cell membrane',
        'Selectively permeable boundary controlling what enters and leaves a cell.',
      ],
      [
        'Nucleus',
        'Membrane-bound control center containing a eukaryotic cell’s DNA.',
      ],
      ['Cytoplasm', 'Gel-like material where many cellular reactions occur.'],
      [
        'Lysosome',
        'Enzyme-filled organelle that breaks down waste and worn-out cell parts.',
      ],
      [
        'Golgi apparatus',
        'Organelle that modifies, sorts, and packages proteins and lipids.',
      ],
      [
        'Endoplasmic reticulum',
        'Membrane network involved in protein and lipid production and transport.',
      ],
      [
        'Osmosis',
        'Diffusion of water across a selectively permeable membrane.',
      ],
      [
        'ATP',
        'The cell’s primary molecule for storing and transferring usable energy.',
      ],
      [
        'Prokaryote',
        'Organism whose cells lack a nucleus and other membrane-bound organelles.',
      ],
      [
        'Homeostasis',
        'Maintenance of stable internal conditions despite external change.',
      ],
    ]),
  },
  {
    id: 'spanish-travel',
    title: 'Spanish II — Travel',
    subject: 'Spanish',
    description: 'Travel vocabulary and useful phrases.',
    termLanguage: 'Spanish',
    definitionLanguage: 'English (US)',
    source: 'Direct vocabulary import',
    color: 'from-[#ec4899] via-[#f97370] to-[#f6b73c]',
    createdAt: now - 86400000 * 12,
    updatedAt: now - 3600000 * 7,
    cards: cards([
      ['el aeropuerto', 'airport'],
      ['el equipaje', 'luggage'],
      ['el pasaporte', 'passport'],
      ['el boleto', 'ticket'],
      ['hacer la maleta', 'to pack a suitcase'],
      ['salir', 'to leave'],
      ['llegar', 'to arrive'],
      ['el vuelo', 'flight'],
      ['la estación', 'station'],
      ['¿Cuánto cuesta?', 'How much does it cost?'],
      ['ida y vuelta', 'round trip'],
      ['la aduana', 'customs'],
    ]),
  },
  {
    id: 'ush-new-deal',
    title: 'APUSH — The New Deal',
    subject: 'U.S. History',
    description: 'Major programs, people, and debates of the New Deal era.',
    termLanguage: 'English (US)',
    definitionLanguage: 'English (US)',
    source: 'Unit 7 reading guide',
    color: 'from-[#2f7be5] via-[#5558dd] to-[#8950db]',
    createdAt: now - 86400000 * 18,
    updatedAt: now - 86400000,
    cards: cards([
      ['FDR', 'Franklin D. Roosevelt, president who launched the New Deal.'],
      [
        'CCC',
        'Civilian Conservation Corps; employed young men on environmental projects.',
      ],
      [
        'WPA',
        'Works Progress Administration; funded public works and arts employment.',
      ],
      [
        'Social Security Act',
        'Created old-age pensions, unemployment insurance, and public assistance.',
      ],
      [
        'FDIC',
        'Federal agency insuring bank deposits to restore confidence in banks.',
      ],
      [
        'Court-packing plan',
        'FDR proposal to add Supreme Court justices after adverse rulings.',
      ],
      [
        'Dust Bowl',
        'Severe drought and erosion that displaced Great Plains farming families.',
      ],
      [
        'New Deal coalition',
        'Political alliance of labor, urban voters, minorities, and Southern Democrats.',
      ],
    ]),
  },
  {
    id: 'sat-core',
    title: 'SAT Vocabulary — Core 20',
    subject: 'Test Prep',
    description: 'High-utility words for reading and writing practice.',
    termLanguage: 'English (US)',
    definitionLanguage: 'English (US)',
    source: 'CSV import',
    color: 'from-[#f59e0b] via-[#f97316] to-[#ef476f]',
    createdAt: now - 86400000 * 8,
    updatedAt: now - 86400000 * 2,
    cards: cards([
      ['Ambivalent', 'Having mixed or contradictory feelings about something.'],
      ['Bolster', 'To support or strengthen.'],
      ['Candid', 'Truthful and straightforward.'],
      ['Deference', 'Respectful submission to another person’s judgment.'],
      ['Empirical', 'Based on observation or experiment rather than theory.'],
      ['Frugal', 'Careful about spending money or resources.'],
      ['Lucid', 'Clear and easy to understand.'],
      ['Mitigate', 'To make something less severe or harmful.'],
      ['Nuance', 'A subtle distinction or variation.'],
      ['Pragmatic', 'Focused on practical results rather than theory.'],
    ]),
  },
];

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function blankCard(): Card {
  return {
    id: makeId('card'),
    term: '',
    definition: '',
    starred: false,
    mastery: 0,
    correct: 0,
    wrong: 0,
  };
}

export function makeCard(term: string, definition: string): Card {
  return { ...blankCard(), term: term.trim(), definition: definition.trim() };
}

export type Delimiter =
  | 'auto'
  | 'tab'
  | 'comma'
  | 'semicolon'
  | 'dash'
  | 'colon'
  | 'double-colon';

const DELIMITERS: Record<Exclude<Delimiter, 'auto'>, string> = {
  tab: '\t',
  comma: ',',
  semicolon: ';',
  dash: ' - ',
  colon: ':',
  'double-colon': '::',
};

export function parseVocab(
  input: string,
  requested: Delimiter = 'auto',
): Card[] {
  const text = input.trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text) as unknown;
    const rows = Array.isArray(parsed)
      ? parsed
      : (parsed as { cards?: unknown[] })?.cards;
    if (Array.isArray(rows)) {
      const result = rows
        .flatMap((row) => {
          if (Array.isArray(row) && row.length >= 2)
            return [makeCard(String(row[0]), String(row[1]))];
          if (
            row &&
            typeof row === 'object' &&
            'term' in row &&
            'definition' in row
          ) {
            const item = row as { term: unknown; definition: unknown };
            return [makeCard(String(item.term), String(item.definition))];
          }
          return [];
        })
        .filter((card) => card.term && card.definition);
      if (result.length) return result;
    }
  } catch {}

  let rows = text
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);
  if (rows.length === 1 && text.includes(';'))
    rows = text
      .split(';')
      .map((row) => row.trim())
      .filter(Boolean);

  return rows.flatMap((row) => {
    const clean = row.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '');
    const candidates =
      requested === 'auto'
        ? ['\t', '::', ' — ', ' - ', ',', ':']
        : [DELIMITERS[requested]];
    const delimiter = candidates.find((candidate) => clean.includes(candidate));
    if (!delimiter) return [];
    const index = clean.indexOf(delimiter);
    const term = clean.slice(0, index).trim();
    const definition = clean.slice(index + delimiter.length).trim();
    return term && definition ? [makeCard(term, definition)] : [];
  });
}

export function notesToCards(input: string): Card[] {
  const imported = parseVocab(input);
  const meaningfulLines = input
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-•*#\d.)]+\s*/, '').trim())
    .filter((line) => line.length > 18);
  if (imported.length >= Math.max(2, Math.floor(meaningfulLines.length * 0.4)))
    return imported;
  const blocks =
    meaningfulLines.length > 1
      ? meaningfulLines
      : input
          .replace(/\s+/g, ' ')
          .split(/(?<=[.!?])\s+/)
          .map((part) => part.trim())
          .filter((part) => part.length > 30);
  return blocks
    .map((block, index) => {
      const explicit = block.match(
        /^(.{2,70}?)\s+(?:is|are|means|refers to|describes|occurs when)\s+(.+)$/i,
      );
      if (explicit) return makeCard(explicit[1], explicit[2]);
      const words = block.replace(/[.!?]+$/, '').split(/\s+/);
      const label = words.slice(0, Math.min(7, words.length)).join(' ');
      return makeCard(
        `Key idea ${index + 1}: ${label}${words.length > 7 ? '…' : ''}`,
        block,
      );
    })
    .filter((card) => card.definition.length > 20);
}

export function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(?:a|an|the)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function answerMatches(
  given: string,
  expected: string,
  grading: AppSettings['grading'],
) {
  const a = normalizeAnswer(given);
  const b = normalizeAnswer(expected);
  if (!a || !b) return false;
  if (grading === 'strict') return a === b;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const expectedWords = new Set(b.split(' ').filter((word) => word.length > 2));
  const givenWords = new Set(a.split(' '));
  const overlap =
    [...expectedWords].filter((word) => givenWords.has(word)).length /
    Math.max(1, expectedWords.size);
  return overlap >= (grading === 'lenient' ? 0.5 : 0.72);
}

export function masteryName(value: Mastery) {
  return ['New', 'Learning', 'Familiar', 'Strong', 'Mastered'][value];
}

export function masteryColor(value: Mastery) {
  return ['#7f8795', '#ff8e72', '#ffc764', '#7fcf6b', '#50d3b4'][value];
}
