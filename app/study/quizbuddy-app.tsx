/* eslint-disable react/react-compiler, jsx-a11y/prefer-tag-over-role -- nested flashcard controls use keyboard-enabled spans to avoid invalid nested buttons. */
'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BookMarked,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  FileSpreadsheet,
  Flame,
  Gamepad2,
  Gauge,
  Home,
  Import,
  Keyboard,
  Layers3,
  Library,
  Lightbulb,
  ListChecks,
  MessageCircle,
  Moon,
  PencilLine,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Share2,
  Shuffle,
  Sparkles,
  Star,
  Sun,
  Target,
  Trash2,
  Trophy,
  Upload,
  Volume2,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  answerMatches,
  blankCard,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  makeId,
  masteryColor,
  masteryName,
  notesToCards,
  parseVocab,
} from './study-data';
import type { Delimiter } from './study-data';
import type {
  AppSettings,
  Card,
  Mastery,
  Mode,
  StudySet,
  StudyStats,
} from './types';
import { extractFileText } from './file-reader';

const STORAGE_KEY = 'quizbuddy-v4';
const SET_COLORS = [
  'from-[#6d5dfc] via-[#3976d9] to-[#1ab8a3]',
  'from-[#ec4899] via-[#f97370] to-[#f6b73c]',
  'from-[#2f7be5] via-[#5558dd] to-[#8950db]',
  'from-[#f59e0b] via-[#f97316] to-[#ef476f]',
];
type StoredState = {
  sets: StudySet[];
  settings: AppSettings;
  stats: StudyStats;
  activeSetId: string;
};
type StudioMethod = 'import' | 'manual' | 'notes' | 'upload';

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid size-9 place-items-center rounded-xl bg-[#6ce5d1] text-[#081713] shadow-[0_0_0_4px_rgba(108,229,209,.08)]">
        <BrainCircuit className="size-5" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-[var(--qb-sidebar)] bg-[#8c7df7]" />
      </div>
      {!compact && (
        <span className="text-xl font-extrabold tracking-[-.055em] text-[var(--qb-sidebar-text)]">
          quizbuddy
        </span>
      )}
    </div>
  );
}

function Sidebar({
  mode,
  sets,
  activeSetId,
  setMode,
  openSet,
}: {
  mode: Mode;
  sets: StudySet[];
  activeSetId: string;
  setMode: (mode: Mode) => void;
  openSet: (id: string) => void;
}) {
  const nav = [
    { id: 'home' as Mode, label: 'Home', icon: Home },
    { id: 'studio' as Mode, label: 'Study studio', icon: Sparkles },
    { id: 'library' as Mode, label: 'Library', icon: Library },
    { id: 'progress' as Mode, label: 'Progress', icon: BarChart3 },
  ];
  const setModes: Mode[] = [
    'set',
    'edit',
    'guide',
    'flashcards',
    'learn',
    'test',
    'write',
    'match',
    'rush',
    'meteor',
  ];
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-[var(--qb-sidebar-border)] bg-[var(--qb-sidebar)] px-3.5 py-5 lg:flex">
      <div className="px-2">
        <Logo />
      </div>
      <Button
        onClick={() => setMode('studio')}
        className="mt-7 h-11 justify-start rounded-xl bg-[#6ce5d1] px-4 font-extrabold text-[#071612] hover:bg-[#88eddd]"
      >
        <Plus /> New study set
      </Button>
      <div className="mt-6 space-y-1">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${mode === id ? 'bg-[var(--qb-sidebar-active)] text-[var(--qb-sidebar-text)]' : 'text-[var(--qb-sidebar-muted)] hover:bg-[var(--qb-sidebar-hover)] hover:text-[var(--qb-sidebar-text)]'}`}
          >
            <Icon className="size-[18px]" />
            {label}
            {id === 'studio' && (
              <span className="ml-auto rounded-full bg-[#312c59] px-2 py-0.5 text-[10px] text-[#d1cbff]">
                SMART
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-7 flex items-center justify-between px-3">
        <span className="text-[.7rem] font-extrabold uppercase tracking-[.14em] text-[var(--qb-sidebar-subtle)]">
          Your sets
        </span>
        <button
          aria-label="Create set"
          onClick={() => setMode('studio')}
          className="text-[var(--qb-sidebar-muted)] hover:text-[var(--qb-sidebar-text)]"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div className="thin-scrollbar mt-2 max-h-[38vh] space-y-1 overflow-y-auto">
        {sets.map((set, index) => (
          <button
            key={set.id}
            onClick={() => openSet(set.id)}
            className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition ${activeSetId === set.id && setModes.includes(mode) ? 'bg-[var(--qb-sidebar-active)] text-[var(--qb-sidebar-text)]' : 'text-[var(--qb-sidebar-muted)] hover:bg-[var(--qb-sidebar-hover)] hover:text-[var(--qb-sidebar-text)]'}`}
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                background: ['#6ce5d1', '#ff8e72', '#8c7df7', '#ffc764'][
                  index % 4
                ],
              }}
            />
            <span className="truncate">{set.title}</span>
            <span className="ml-auto text-[10px] text-[var(--qb-sidebar-subtle)]">
              {set.cards.length}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-auto space-y-1 border-t border-[var(--qb-sidebar-border)] pt-4">
        <button
          onClick={() => setMode('settings')}
          className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold ${mode === 'settings' ? 'bg-[var(--qb-sidebar-active)] text-[var(--qb-sidebar-text)]' : 'text-[var(--qb-sidebar-muted)] hover:text-[var(--qb-sidebar-text)]'}`}
        >
          <Settings className="size-[18px]" /> Settings
        </button>
        <button
          onClick={() =>
            window.open(
              'https://github.com/timlightson/quizbuddy#readme',
              '_blank',
              'noopener,noreferrer',
            )
          }
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[var(--qb-sidebar-muted)] hover:text-[var(--qb-sidebar-text)]"
        >
          <CircleHelp className="size-[18px]" /> Help & shortcuts
        </button>
        <div className="mt-2 rounded-xl bg-[var(--qb-sidebar-card)] px-3 py-2.5">
          <p className="text-xs font-bold text-[var(--qb-teal-text)]">
            Everything unlocked
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--qb-sidebar-muted)]">
            No ads. No card limits.
          </p>
        </div>
      </div>
    </aside>
  );
}

function Topbar({
  query,
  setQuery,
  sets,
  light,
  setLight,
  setMode,
  openSet,
}: {
  query: string;
  setQuery: (query: string) => void;
  sets: StudySet[];
  light: boolean;
  setLight: (light: boolean) => void;
  setMode: (mode: Mode) => void;
  openSet: (id: string) => void;
}) {
  const results = query.trim()
    ? sets
        .filter((set) =>
          `${set.title} ${set.subject} ${set.cards.map((card) => card.term).join(' ')}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 5)
    : [];
  return (
    <header className="sticky top-0 z-20 flex h-[70px] items-center gap-3 border-b border-border/80 bg-background/92 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="lg:hidden">
        <Logo compact />
      </div>
      <div className="relative w-full max-w-[590px]">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search sets and cards"
          placeholder="Search sets and cards…"
          className="h-11 w-full rounded-xl border border-border bg-[var(--qb-field)] pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-[#6ce5d1]/70 focus:ring-4 focus:ring-[#6ce5d1]/10"
        />
        {results.length > 0 && (
          <div className="absolute inset-x-0 top-12 rounded-xl border border-border bg-popover p-2 shadow-2xl">
            {results.map((set) => (
              <button
                key={set.id}
                onClick={() => {
                  openSet(set.id);
                  setQuery('');
                }}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-muted"
              >
                <Layers3 className="size-4 text-[var(--qb-teal-text)]" />
                <span className="text-sm font-bold">{set.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {set.cards.length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          onClick={() => setMode('studio')}
          className="hidden h-10 rounded-xl bg-[#7c6cf5] px-4 font-extrabold text-white hover:bg-[#8d7ffd] sm:flex"
        >
          <Sparkles /> Study studio
        </Button>
        <Button
          onClick={() => setLight(!light)}
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
        >
          {light ? <Moon /> : <Sun />}
        </Button>
        <Button
          onClick={() => setMode('settings')}
          variant="ghost"
          size="icon"
          aria-label="Open settings"
        >
          <Settings />
        </Button>
        <Button
          onClick={() => setMode('studio')}
          variant="outline"
          size="icon"
          aria-label="Create set"
        >
          <Plus />
        </Button>
      </div>
    </header>
  );
}

function Metric({
  value,
  label,
  sub,
  color,
}: {
  value: string;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-2xl font-extrabold tracking-tight"
            style={{ color }}
          >
            {value}
          </p>
          <p className="mt-1 text-sm font-bold">{label}</p>
        </div>
        <div className="grid size-11 place-items-center rounded-xl bg-muted">
          <Gauge className="size-5" style={{ color }} />
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
function SetRow({ set, onClick }: { set: StudySet; onClick: () => void }) {
  const mastered = set.cards.filter((card) => card.mastery >= 3).length;
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-[20px] border border-border bg-card p-4 text-left transition hover:border-[#4b5361]"
    >
      <div
        className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${set.color}`}
      >
        <span className="text-sm font-extrabold text-white">
          {set.subject.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-extrabold">{set.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {set.cards.length} cards · {mastered} strong
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#6ce5d1]"
            style={{
              width: `${set.cards.length ? (mastered / set.cards.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
      <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-1" />
    </button>
  );
}

function HomeView({
  sets,
  stats,
  settings,
  setMode,
  openSet,
}: {
  sets: StudySet[];
  stats: StudyStats;
  settings: AppSettings;
  setMode: (mode: Mode) => void;
  openSet: (id: string) => void;
}) {
  const total = sets.reduce((sum, set) => sum + set.cards.length, 0);
  const due = sets.reduce(
    (sum, set) => sum + set.cards.filter((card) => card.mastery < 3).length,
    0,
  );
  const accuracy = stats.reviews
    ? Math.round((stats.correct / stats.reviews) * 100)
    : 0;
  const actions = [
    {
      title: 'Import vocabulary',
      copy: 'Paste term + definition lists, spreadsheets, CSV, TSV, or JSON.',
      action: 'Import',
      icon: FileSpreadsheet,
      tone: 'bg-[var(--qb-selected)] text-[var(--qb-teal-text)]',
      mode: 'studio' as Mode,
    },
    {
      title: 'Notes → study pack',
      copy: 'Turn notes into cards, a guide, essay prompts, and test material.',
      action: 'Build pack',
      icon: WandSparkles,
      tone: 'bg-[var(--qb-purple-surface)] text-[var(--qb-purple-text)]',
      mode: 'studio' as Mode,
    },
    {
      title: 'Write cards manually',
      copy: 'Create and edit as many cards as you need, with no cap.',
      action: 'Create',
      icon: PencilLine,
      tone: 'bg-[var(--qb-pink-surface)] text-[var(--qb-pink-text)]',
      mode: 'studio' as Mode,
    },
    {
      title: 'Practice test',
      copy: 'Mix multiple choice, true/false, and written responses.',
      action: 'Start',
      icon: ListChecks,
      tone: 'bg-[var(--qb-blue-surface)] text-[var(--qb-blue-text)]',
      mode: 'test' as Mode,
    },
    {
      title: 'Play a game',
      copy: 'Match, Meteor, or Quiz Rush—all count toward mastery.',
      action: 'Play',
      icon: Gamepad2,
      tone: 'bg-[var(--qb-gold-surface)] text-[var(--qb-gold-text)]',
      mode: 'rush' as Mode,
    },
  ];
  return (
    <div className="mx-auto max-w-[1240px] p-4 pb-28 sm:p-7 lg:p-9">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--qb-teal-text)]">
            Your study space
          </p>
          <h1 className="mt-1 text-[clamp(2rem,5vw,3.6rem)] font-extrabold tracking-[-.065em]">
            Ready when you are.
          </h1>
          <p className="mt-2 text-muted-foreground">
            {due} cards ready across {sets.length} sets.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <Flame className="size-5 fill-[#ffc764] text-[#ffc764]" />
          <span className="font-extrabold">{stats.streak} day streak</span>
        </div>
      </div>
      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {actions.map(({ title, copy, action, icon: Icon, tone, mode }) => (
          <button
            key={title}
            onClick={() => setMode(mode)}
            className="group min-h-52 rounded-[22px] border border-border bg-card p-5 text-left transition hover:-translate-y-1 hover:border-[#4b5361] hover:shadow-[0_18px_50px_rgba(0,0,0,.22)]"
          >
            <span
              className={`grid size-11 place-items-center rounded-2xl ${tone}`}
            >
              <Icon className="size-5" />
            </span>
            <h2 className="mt-7 text-[1.02rem] font-extrabold tracking-[-.025em]">
              {title}
            </h2>
            <p className="mt-2 min-h-14 text-sm leading-5 text-muted-foreground">
              {copy}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold">
              {action}
              <ChevronRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </button>
        ))}
      </section>
      <section className="mt-5 grid gap-3 md:grid-cols-3">
        <Metric
          value={`${Math.min(100, Math.round((stats.reviews / settings.dailyGoal) * 100))}%`}
          label="Daily goal"
          sub={`${stats.reviews} of ${settings.dailyGoal} reviews`}
          color="#6ce5d1"
        />
        <Metric
          value={`${accuracy}%`}
          label="Lifetime accuracy"
          sub={`${stats.correct} correct answers`}
          color="#8c7df7"
        />
        <Metric
          value={String(total)}
          label="Cards in your library"
          sub={`${stats.xp} total XP`}
          color="#ffc764"
        />
      </section>
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[var(--qb-teal-text)]">
              Ready for review
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-[-.045em]">
              Your study sets
            </h2>
          </div>
          <button
            onClick={() => setMode('library')}
            className="text-sm font-extrabold text-[var(--qb-teal-text)]"
          >
            View all
          </button>
        </div>
        {sets.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {sets.slice(0, 4).map((set) => (
              <SetRow key={set.id} set={set} onClick={() => openSet(set.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-card px-6 py-10 text-center">
            <Layers3 className="mx-auto size-9 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-extrabold">
              Start with your own material
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Import an existing vocabulary list, upload class notes, or build
              your first set from scratch. Your library starts completely empty.
            </p>
            <Button
              onClick={() => setMode('studio')}
              className="mt-5 bg-[#6ce5d1] font-extrabold text-[#071612] hover:bg-[#88eddd]"
            >
              <Sparkles /> Open Study Studio
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="text-sm font-bold text-muted-foreground">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-border bg-[var(--qb-field)] px-4 text-foreground outline-none focus:border-[#6ce5d1]"
      />
    </label>
  );
}

function StudioView({ onCreate }: { onCreate: (set: StudySet) => void }) {
  const [method, setMethod] = useState<StudioMethod>('import');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [delimiter, setDelimiter] = useState<Delimiter>('auto');
  const [manual, setManual] = useState<Card[]>([
    blankCard(),
    blankCard(),
    blankCard(),
  ]);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
  const parsed = useMemo(
    () =>
      method === 'manual'
        ? manual.filter((card) => card.term.trim() && card.definition.trim())
        : method === 'notes' || method === 'upload'
          ? notesToCards(text)
          : parseVocab(text, delimiter),
    [method, manual, text, delimiter],
  );
  const methods = [
    {
      id: 'import' as StudioMethod,
      label: 'Import vocab',
      icon: FileSpreadsheet,
      copy: 'Terms + definitions',
    },
    {
      id: 'manual' as StudioMethod,
      label: 'Manual cards',
      icon: PencilLine,
      copy: 'Full editor',
    },
    {
      id: 'notes' as StudioMethod,
      label: 'Notes to pack',
      icon: WandSparkles,
      copy: 'Cards + guide',
    },
    {
      id: 'upload' as StudioMethod,
      label: 'Upload file',
      icon: Upload,
      copy: 'PDF, DOCX, TXT, CSV, TSV, MD, JSON',
    },
  ];
  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setError('');
    try {
      setText(await extractFileText(file));
    } catch (reason) {
      setText('');
      setError(
        reason instanceof Error
          ? reason.message
          : 'Quizbuddy could not read this file.',
      );
    }
  };
  const updateManual = (
    id: string,
    key: 'term' | 'definition',
    value: string,
  ) =>
    setManual((cards) =>
      cards.map((card) => (card.id === id ? { ...card, [key]: value } : card)),
    );
  const create = () => {
    if (!parsed.length) {
      setError('Add at least one complete term and definition.');
      return;
    }
    const cleanTitle =
      title.trim() ||
      filename.replace(/\.[^.]+$/, '') ||
      `${subject.trim() || 'Untitled'} study set`;
    onCreate({
      id: makeId('set'),
      title: cleanTitle,
      subject: subject.trim() || 'General',
      description:
        method === 'notes' || method === 'upload'
          ? 'A complete study pack made from your source material.'
          : 'Created in Quizbuddy Studio.',
      termLanguage: 'English (US)',
      definitionLanguage: 'English (US)',
      cards: parsed.map((card) => ({ ...card, id: makeId('card') })),
      source:
        method === 'notes'
          ? 'Notes to study pack'
          : method === 'upload'
            ? filename || 'Uploaded file'
            : method === 'import'
              ? 'Direct vocabulary import'
              : 'Manual editor',
      notes: method === 'notes' || method === 'upload' ? text : undefined,
      color: SET_COLORS[Math.floor(Date.now() / 1000) % SET_COLORS.length],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };
  return (
    <div className="mx-auto max-w-[1160px] p-4 pb-28 sm:p-7 lg:p-9">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[var(--qb-teal-text)]">
          Quizbuddy Studio
        </p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-[-.06em]">
          Create without limits.
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
          Start with finished vocabulary, raw notes, a file, or a blank set.
          Every complete pair becomes a card—there is no generation cap.
        </p>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {methods.map(({ id, label, icon: Icon, copy }) => (
          <button
            aria-label={label}
            key={id}
            onClick={() => {
              setMethod(id);
              setError('');
            }}
            className={`rounded-2xl border p-4 text-left transition ${method === id ? 'border-[#6ce5d1] bg-[var(--qb-selected)] text-[var(--qb-selected-foreground)]' : 'border-border bg-card hover:border-[#4b5361]'}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid size-10 place-items-center rounded-xl ${method === id ? 'bg-[#6ce5d1] text-[#071612]' : 'bg-muted text-muted-foreground'}`}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold">{label}</p>
                <p className="text-xs text-muted-foreground">{copy}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-[24px] border border-border bg-card p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Set title"
              value={title}
              onChange={setTitle}
              placeholder="e.g. Anatomy Unit 1"
            />
            <Field
              label="Subject"
              value={subject}
              onChange={setSubject}
              placeholder="e.g. Human Anatomy"
            />
          </div>
          {method === 'import' && (
            <div className="mt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-extrabold">
                    Paste terms and definitions
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    One card per line. Separate each pair with a tab, comma,
                    dash, colon, or <code>::</code>.
                  </p>
                </div>
                <label className="text-xs font-bold text-muted-foreground">
                  Separator
                  <select
                    value={delimiter}
                    onChange={(event) =>
                      setDelimiter(event.target.value as Delimiter)
                    }
                    className="ml-2 h-9 rounded-lg border border-border bg-background px-2 text-foreground"
                  >
                    <option value="auto">Auto detect</option>
                    <option value="tab">Tab</option>
                    <option value="comma">Comma</option>
                    <option value="dash">Dash</option>
                    <option value="colon">Colon</option>
                    <option value="double-colon">Double colon</option>
                    <option value="semicolon">Semicolon</option>
                  </select>
                </label>
              </div>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={
                  'Mitochondria\tProduces usable energy\nRibosome\tBuilds proteins\nOsmosis\tMovement of water across a membrane'
                }
                className="mt-4 min-h-80 w-full resize-y rounded-2xl border border-[var(--qb-field-border)] bg-[var(--qb-field-strong)] p-5 font-mono text-sm leading-7 text-foreground outline-none focus:border-[#6ce5d1]"
              />
            </div>
          )}
          {method === 'notes' && (
            <div className="mt-6">
              <h2 className="font-extrabold">Paste your class material</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use lecture notes, a reading, study guide, or outline. Quizbuddy
                extracts every meaningful idea and saves the original notes with
                the set.
              </p>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste notes here. Headings, bullets, definitions, and full paragraphs all work…"
                className="mt-4 min-h-96 w-full resize-y rounded-2xl border border-[var(--qb-field-border)] bg-[var(--qb-field-strong)] p-5 text-sm leading-7 text-foreground outline-none focus:border-[#6ce5d1]"
              />
            </div>
          )}
          {method === 'upload' && (
            <div className="mt-6">
              <label
                htmlFor="studio-upload"
                className="flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--qb-field-border)] bg-[var(--qb-field-strong)] p-8 text-center transition hover:border-[#6ce5d1]"
              >
                <span className="grid size-14 place-items-center rounded-2xl bg-[var(--qb-selected)] text-[var(--qb-teal-text)]">
                  <Upload className="size-6" />
                </span>
                <h2 className="mt-5 font-extrabold">
                  {filename || 'Choose a paper, vocab list, or notes file'}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  PDF, DOCX, TXT, CSV, TSV, Markdown, and Quizbuddy JSON are
                  read locally in your browser.
                </p>
                <span className="mt-5 rounded-xl bg-[#6ce5d1] px-4 py-2 text-sm font-extrabold text-[#071612]">
                  Browse files
                </span>
              </label>
              <input
                id="studio-upload"
                type="file"
                accept=".pdf,.docx,.txt,.csv,.tsv,.md,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(event) => void readFile(event)}
              />
              {text && (
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  className="mt-4 min-h-52 w-full rounded-2xl border border-border bg-background p-4 font-mono text-sm"
                />
              )}
            </div>
          )}
          {method === 'manual' && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold">Cards</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add as many as you need. Empty rows are ignored.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setManual((cards) => [...cards, blankCard()])}
                >
                  <Plus /> Add card
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {manual.map((card, index) => (
                  <div
                    key={card.id}
                    className="grid gap-3 rounded-2xl border border-border bg-[var(--qb-field)] p-4 sm:grid-cols-[36px_1fr_1fr_40px] sm:items-center"
                  >
                    <span className="text-center text-xs font-extrabold text-muted-foreground">
                      {index + 1}
                    </span>
                    <input
                      value={card.term}
                      onChange={(event) =>
                        updateManual(card.id, 'term', event.target.value)
                      }
                      placeholder="Term"
                      className="h-12 rounded-xl border border-border bg-card px-3 outline-none focus:border-[#6ce5d1]"
                    />
                    <input
                      value={card.definition}
                      onChange={(event) =>
                        updateManual(card.id, 'definition', event.target.value)
                      }
                      placeholder="Definition"
                      className="h-12 rounded-xl border border-border bg-card px-3 outline-none focus:border-[#6ce5d1]"
                    />
                    <Button
                      aria-label="Delete card"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setManual((cards) =>
                          cards.filter((item) => item.id !== card.id),
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full border-dashed"
                onClick={() =>
                  setManual((cards) => [
                    ...cards,
                    blankCard(),
                    blankCard(),
                    blankCard(),
                  ])
                }
              >
                <Plus /> Add three rows
              </Button>
            </div>
          )}
          {error && (
            <div className="mt-5 rounded-xl border border-[var(--qb-danger-text)]/40 bg-[var(--qb-danger-surface)] p-4 text-sm font-semibold text-[var(--qb-danger-text)]">
              {error}
            </div>
          )}
        </section>
        <aside className="h-fit rounded-[24px] border border-border bg-card p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">Live preview</h2>
            <span className="rounded-full bg-[var(--qb-selected)] px-2.5 py-1 text-xs font-extrabold text-[var(--qb-teal-text)]">
              {parsed.length} cards
            </span>
          </div>
          <div className="thin-scrollbar mt-4 max-h-80 space-y-2 overflow-y-auto">
            {parsed.length ? (
              parsed.map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className="rounded-xl border border-border bg-[var(--qb-field)] p-3"
                >
                  <p className="truncate text-sm font-extrabold">{card.term}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {card.definition}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Layers3 className="mx-auto size-7 text-muted-foreground" />
                <p className="mt-3 text-sm font-bold">Your cards appear here</p>
              </div>
            )}
          </div>
          <div className="mt-5 space-y-2 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Check className="size-4 text-[var(--qb-teal-text)]" /> No
              artificial card limit
            </p>
            <p className="flex items-center gap-2">
              <Check className="size-4 text-[var(--qb-teal-text)]" /> Fully
              editable after import
            </p>
            <p className="flex items-center gap-2">
              <Check className="size-4 text-[var(--qb-teal-text)]" /> Stored on
              this device
            </p>
          </div>
          <Button
            onClick={create}
            disabled={!parsed.length}
            className="mt-6 h-12 w-full rounded-xl bg-[#6ce5d1] text-base font-extrabold text-[#071612] hover:bg-[#88eddd]"
          >
            <Sparkles /> Create {parsed.length || ''} cards
          </Button>
        </aside>
      </div>
    </div>
  );
}

function EditorView({
  set,
  onSave,
  onCancel,
}: {
  set: StudySet;
  onSave: (set: StudySet) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<StudySet>(() => ({
    ...set,
    cards: set.cards.map((card) => ({ ...card })),
  }));
  const [bulk, setBulk] = useState('');
  const [showImport, setShowImport] = useState(false);
  const updateCard = (id: string, patch: Partial<Card>) =>
    setDraft((current) => ({
      ...current,
      cards: current.cards.map((card) =>
        card.id === id ? { ...card, ...patch } : card,
      ),
    }));
  const move = (index: number, direction: number) =>
    setDraft((current) => {
      const cards = [...current.cards];
      const next = index + direction;
      if (next < 0 || next >= cards.length) return current;
      [cards[index], cards[next]] = [cards[next], cards[index]];
      return { ...current, cards };
    });
  const importCards = () => {
    const parsed = parseVocab(bulk);
    if (parsed.length) {
      setDraft((current) => ({
        ...current,
        cards: [...current.cards, ...parsed],
      }));
      setBulk('');
      setShowImport(false);
    }
  };
  return (
    <div className="mx-auto max-w-[1120px] p-4 pb-28 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft />
        </Button>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[var(--qb-teal-text)]">
            Set editor
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-.05em]">
            Edit your set
          </h1>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(!showImport)}>
            <Import /> Import more
          </Button>
          <Button
            onClick={() =>
              onSave({
                ...draft,
                cards: draft.cards.filter(
                  (card) => card.term.trim() && card.definition.trim(),
                ),
                updatedAt: Date.now(),
              })
            }
            className="bg-[#6ce5d1] font-extrabold text-[#071612]"
          >
            <Save /> Save set
          </Button>
        </div>
      </div>
      <section className="mt-6 rounded-[24px] border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-muted-foreground sm:col-span-2">
            Title
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-lg font-bold outline-none focus:border-[#6ce5d1]"
            />
          </label>
          <Field
            label="Subject"
            value={draft.subject}
            onChange={(subject) => setDraft({ ...draft, subject })}
            placeholder="Subject"
          />
          <Field
            label="Description"
            value={draft.description}
            onChange={(description) => setDraft({ ...draft, description })}
            placeholder="What is this set for?"
          />
          <label className="text-sm font-bold text-muted-foreground">
            Term language
            <select
              value={draft.termLanguage}
              onChange={(event) =>
                setDraft({ ...draft, termLanguage: event.target.value })
              }
              className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-foreground"
            >
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Latin</option>
            </select>
          </label>
          <label className="text-sm font-bold text-muted-foreground">
            Definition language
            <select
              value={draft.definitionLanguage}
              onChange={(event) =>
                setDraft({ ...draft, definitionLanguage: event.target.value })
              }
              className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-foreground"
            >
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Latin</option>
            </select>
          </label>
        </div>
      </section>
      {showImport && (
        <section className="mt-4 rounded-[24px] border border-[#8c7df7]/50 bg-[var(--qb-soft-purple)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold">Bulk import</h2>
              <p className="text-sm text-muted-foreground">
                Paste any supported format. New cards append to this set.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowImport(false)}
            >
              <X />
            </Button>
          </div>
          <textarea
            value={bulk}
            onChange={(event) => setBulk(event.target.value)}
            placeholder={'Term\tDefinition\nTerm\tDefinition'}
            className="mt-4 min-h-40 w-full rounded-xl border border-border bg-background p-4 font-mono text-sm"
          />
          <Button
            onClick={importCards}
            disabled={!parseVocab(bulk).length}
            className="mt-3 bg-[#8c7df7] font-extrabold text-white"
          >
            Add {parseVocab(bulk).length || ''} cards
          </Button>
        </section>
      )}
      <div className="mt-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.14em] text-muted-foreground">
            {draft.cards.length} cards
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit, star, reorder, or remove any card.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            setDraft((current) => ({
              ...current,
              cards: [...current.cards, blankCard()],
            }))
          }
        >
          <Plus /> Add card
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {draft.cards.map((card, index) => (
          <div
            key={card.id}
            className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[40px_1fr_1.35fr_132px] sm:items-center"
          >
            <span className="text-center text-xs font-extrabold text-muted-foreground">
              {index + 1}
            </span>
            <textarea
              aria-label={`Term ${index + 1}`}
              value={card.term}
              onChange={(event) =>
                updateCard(card.id, { term: event.target.value })
              }
              placeholder="Term"
              rows={2}
              className="resize-none rounded-xl border border-border bg-background p-3 font-bold outline-none focus:border-[#6ce5d1]"
            />
            <textarea
              aria-label={`Definition ${index + 1}`}
              value={card.definition}
              onChange={(event) =>
                updateCard(card.id, { definition: event.target.value })
              }
              placeholder="Definition"
              rows={2}
              className="resize-none rounded-xl border border-border bg-background p-3 text-sm leading-6 outline-none focus:border-[#6ce5d1]"
            />
            <div className="flex justify-end">
              <Button
                aria-label="Star card"
                variant="ghost"
                size="icon"
                onClick={() => updateCard(card.id, { starred: !card.starred })}
              >
                <Star
                  className={
                    card.starred ? 'fill-[#ffc764] text-[#ffc764]' : ''
                  }
                />
              </Button>
              <Button
                aria-label="Move up"
                variant="ghost"
                size="icon"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp />
              </Button>
              <Button
                aria-label="Move down"
                variant="ghost"
                size="icon"
                disabled={index === draft.cards.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown />
              </Button>
              <Button
                aria-label="Delete card"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    cards: current.cards.filter((item) => item.id !== card.id),
                  }))
                }
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        className="mt-4 h-12 w-full border-dashed"
        onClick={() =>
          setDraft((current) => ({
            ...current,
            cards: [...current.cards, blankCard()],
          }))
        }
      >
        <Plus /> Add another card
      </Button>
    </div>
  );
}

const STUDY_MODES: Array<{
  id: Mode;
  title: string;
  copy: string;
  icon: typeof Layers3;
  color: string;
}> = [
  {
    id: 'flashcards',
    title: 'Flashcards',
    copy: 'Flip, speak, shuffle, and self-grade',
    icon: Layers3,
    color: '#6ce5d1',
  },
  {
    id: 'learn',
    title: 'Learn',
    copy: 'Adaptive mixed-question rounds',
    icon: BrainCircuit,
    color: '#9a8cff',
  },
  {
    id: 'test',
    title: 'Practice test',
    copy: 'Multiple choice, true/false, and written',
    icon: ListChecks,
    color: '#80a8ff',
  },
  {
    id: 'write',
    title: 'Write',
    copy: 'Type answers with smart local grading',
    icon: Keyboard,
    color: '#f47bb5',
  },
  {
    id: 'match',
    title: 'Match',
    copy: 'Pair every term against the clock',
    icon: Gamepad2,
    color: '#ffc764',
  },
  {
    id: 'meteor',
    title: 'Meteor',
    copy: 'Recall the answer before time runs out',
    icon: Target,
    color: '#ff7b72',
  },
  {
    id: 'rush',
    title: 'Quiz Rush',
    copy: 'A sixty-second speed round',
    icon: Zap,
    color: '#ff9b4a',
  },
  {
    id: 'guide',
    title: 'Study guide',
    copy: 'Summary, concepts, and essay prompts',
    icon: BookMarked,
    color: '#50d3b4',
  },
];

function SetView({
  set,
  setMode,
  onEdit,
  onToggleStar,
}: {
  set: StudySet;
  setMode: (mode: Mode) => void;
  onEdit: () => void;
  onToggleStar: (id: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'starred' | 'trouble' | 'new'>(
    'all',
  );
  const mastered = set.cards.filter((card) => card.mastery >= 3).length;
  const shown = set.cards.filter(
    (card) =>
      filter === 'all' ||
      (filter === 'starred' && card.starred) ||
      (filter === 'trouble' && card.wrong > card.correct) ||
      (filter === 'new' && card.mastery === 0),
  );
  const buckets = [0, 1, 2, 3, 4].map(
    (value) => set.cards.filter((card) => card.mastery === value).length,
  );
  return (
    <div className="mx-auto max-w-[1180px] p-4 pb-28 sm:p-8">
      <section
        className={`relative overflow-hidden rounded-[28px] bg-gradient-to-r ${set.color} p-6 text-white sm:p-9`}
      >
        <div className="absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-extrabold">
              {set.cards.length} cards
            </span>
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-extrabold">
              {set.subject}
            </span>
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-extrabold">
              {set.cards.filter((card) => card.mastery < 3).length} due
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-[clamp(2rem,5vw,4.2rem)] font-extrabold leading-[.98] tracking-[-.065em]">
            {set.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
            {set.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              onClick={() => setMode('learn')}
              className="h-12 bg-white px-5 font-extrabold text-[#11151d] hover:bg-white/90"
            >
              <Zap /> Start learning
            </Button>
            <Button
              onClick={onEdit}
              className="h-12 border border-white/20 bg-black/20 px-5 font-extrabold text-white hover:bg-black/30"
            >
              <PencilLine /> Edit set
            </Button>
            <Button
              onClick={() => void shareSet(set)}
              className="h-12 border border-white/20 bg-black/20 font-extrabold text-white hover:bg-black/30"
            >
              <Share2 /> Share
            </Button>
          </div>
        </div>
      </section>
      <p className="mt-9 text-xs font-extrabold uppercase tracking-[.16em] text-muted-foreground">
        Study modes
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STUDY_MODES.map(({ id, title, copy, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className="group flex items-center gap-4 rounded-[18px] border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-[#4b5361]"
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted"
              style={{ color }}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-extrabold">{title}</span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                {copy}
              </span>
            </span>
          </button>
        ))}
      </div>
      <section className="mt-6 rounded-[22px] border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold">Mastery</h2>
            <p className="text-sm text-muted-foreground">
              {mastered} cards are strong or mastered.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-bold">
            {buckets.map((count, index) => (
              <span key={index} className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: masteryColor(index as Mastery) }}
                />
                {masteryName(index as Mastery)} {count}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-muted">
          {buckets.map((count, index) => (
            <span
              key={index}
              style={{
                width: `${set.cards.length ? (count / set.cards.length) * 100 : 0}%`,
                background: masteryColor(index as Mastery),
              }}
            />
          ))}
        </div>
      </section>
      <section className="mt-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-muted-foreground">
              Cards
            </p>
            <h2 className="mt-1 text-2xl font-extrabold">
              Everything in this set
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'starred', 'trouble', 'new'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full border px-4 py-2 text-xs font-extrabold capitalize ${filter === item ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-muted-foreground'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {shown.map((card, index) => (
            <div
              key={card.id}
              className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[42px_.75fr_1.3fr_125px] sm:items-center"
            >
              <span className="text-center text-xs font-extrabold text-muted-foreground">
                {index + 1}
              </span>
              <p className="font-extrabold">{card.term}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {card.definition}
              </p>
              <div className="flex items-center justify-end gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                  style={{
                    background: `${masteryColor(card.mastery)}20`,
                    color: masteryColor(card.mastery),
                  }}
                >
                  {masteryName(card.mastery)}
                </span>
                <Button
                  aria-label="Star"
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStar(card.id)}
                >
                  <Star
                    className={
                      card.starred ? 'fill-[#ffc764] text-[#ffc764]' : ''
                    }
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StudyHeader({
  set,
  mode,
  progress,
  onExit,
}: {
  set: StudySet;
  mode: string;
  progress: number;
  onExit: () => void;
}) {
  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <Button onClick={onExit} variant="ghost" size="icon">
          <X />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold">{set.title}</p>
          <p className="text-xs text-muted-foreground">{mode}</p>
        </div>
        <span className="ml-auto text-sm font-extrabold text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="mb-7" />
    </>
  );
}
function speak(text: string, settings: AppSettings) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = settings.speechRate;
  window.speechSynthesis.speak(utterance);
}
function playTone(settings: AppSettings, correct: boolean) {
  if (!settings.sounds || typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = correct ? 660 : 190;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  } catch {}
}

function FlashcardsView({
  set,
  settings,
  onExit,
  onReview,
  onToggleStar,
}: {
  set: StudySet;
  settings: AppSettings;
  onExit: () => void;
  onReview: (id: string, result: Mastery) => void;
  onToggleStar: (id: string) => void;
}) {
  const [deck, setDeck] = useState<Card[]>(set.cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck[index % deck.length];
  const move = (step: number) => {
    setIndex((value) => (value + step + deck.length) % deck.length);
    setFlipped(false);
  };
  const front = settings.promptSide === 'term' ? card.term : card.definition;
  const back = settings.promptSide === 'term' ? card.definition : card.term;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, button, [role="button"]'))
        return;
      if (event.code === 'Space') {
        event.preventDefault();
        setFlipped((value) => !value);
      }
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
  useEffect(() => {
    if (settings.readAloud) speak(front, settings);
  }, [front, index, settings]);
  return (
    <div className="mx-auto max-w-5xl p-4 pb-28 sm:p-8">
      <StudyHeader
        set={set}
        mode="Flashcards"
        progress={((index + 1) / deck.length) * 100}
        onExit={onExit}
      />
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => {
            setDeck(set.cards);
            setIndex(0);
          }}
          className="rounded-full bg-foreground px-4 py-2 text-xs font-extrabold text-background"
        >
          All cards
        </button>
        <button
          onClick={() => {
            const starred = set.cards.filter((item) => item.starred);
            if (starred.length) {
              setDeck(starred);
              setIndex(0);
            }
          }}
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-extrabold"
        >
          Starred
        </button>
        <button
          onClick={() => setDeck((cards) => [...cards].reverse())}
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-extrabold"
        >
          <Shuffle className="mr-1 inline size-3" /> Shuffle
        </button>
      </div>
      <button
        onClick={() => setFlipped(!flipped)}
        className="relative flex min-h-[430px] w-full items-center justify-center rounded-[28px] border border-border bg-card p-10 text-center shadow-[0_28px_80px_rgba(0,0,0,.18)]"
      >
        <span className="absolute left-6 top-5 text-xs font-extrabold uppercase tracking-[.14em] text-muted-foreground">
          {flipped ? 'Answer' : 'Prompt'}
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label="Read card aloud"
          onClick={(event) => {
            event.stopPropagation();
            speak(flipped ? back : front, settings);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              speak(flipped ? back : front, settings);
            }
          }}
          className="absolute right-16 top-5 text-muted-foreground hover:text-foreground"
        >
          <Volume2 className="size-5" />
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label="Star card"
          onClick={(event) => {
            event.stopPropagation();
            onToggleStar(card.id);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onToggleStar(card.id);
            }
          }}
          className="absolute right-6 top-5 text-muted-foreground hover:text-foreground"
        >
          <Star
            className={`size-5 ${card.starred ? 'fill-[#ffc764] text-[#ffc764]' : ''}`}
          />
        </span>
        <p
          className={`${flipped ? 'max-w-3xl text-2xl leading-relaxed' : 'text-[clamp(2.35rem,7vw,5rem)]'} font-extrabold tracking-[-.055em]`}
        >
          {flipped ? back : front}
        </p>
        <p className="absolute bottom-5 text-xs text-muted-foreground">
          Click or press space to flip
        </p>
      </button>
      {flipped ? (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { label: 'Again', value: 0, color: '#ff7b72' },
              { label: 'Hard', value: 1, color: '#ff9b4a' },
              { label: 'Good', value: 3, color: '#6ce5d1' },
              { label: 'Easy', value: 4, color: '#8c7df7' },
            ] as Array<{ label: string; value: Mastery; color: string }>
          ).map((item) => (
            <button
              key={item.label}
              onClick={() => {
                onReview(card.id, item.value);
                move(1);
              }}
              className="h-12 rounded-xl border border-border bg-card text-sm font-extrabold"
              style={{ color: item.color }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="secondary" size="icon-lg" onClick={() => move(-1)}>
            <ArrowLeft />
          </Button>
          <Button
            className="h-12 min-w-44 bg-[#6ce5d1] font-extrabold text-[#071612]"
            onClick={() => setFlipped(true)}
          >
            Show answer
          </Button>
          <Button variant="secondary" size="icon-lg" onClick={() => move(1)}>
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}

function getOptions(cards: Card[], index: number, answer: string) {
  const others = cards
    .filter((card) => card.definition !== answer)
    .map((card) => card.definition);
  const offset = index % Math.max(1, others.length);
  const picked = others
    .slice(offset)
    .concat(others.slice(0, offset))
    .slice(0, 3);
  return [picked[0], answer, picked[1], picked[2]].filter(Boolean);
}
function LearnView({
  set,
  settings,
  onExit,
  onReview,
}: {
  set: StudySet;
  settings: AppSettings;
  onExit: () => void;
  onReview: (id: string, result: Mastery) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const card = set.cards[index % set.cards.length];
  const options = getOptions(set.cards, index, card.definition);
  const answer = (value: string) => {
    if (selected) return;
    setSelected(value);
    const correct = value === card.definition;
    playTone(settings, correct);
    onReview(card.id, correct ? (Math.min(4, card.mastery + 1) as Mastery) : 1);
    if (correct) setScore((value) => value + 1);
  };
  return (
    <div className="mx-auto max-w-4xl p-4 pb-28 sm:p-8">
      <StudyHeader
        set={set}
        mode="Adaptive Learn"
        progress={(((index % set.cards.length) + 1) / set.cards.length) * 100}
        onExit={onExit}
      />
      <div className="mb-4 flex justify-between text-sm font-bold text-muted-foreground">
        <span>Pick the definition</span>
        <span>{score} correct</span>
      </div>
      <section className="rounded-[26px] border border-border bg-card p-6 sm:p-9">
        <div className="flex items-center justify-between">
          <span className="rounded-lg bg-[var(--qb-purple-surface)] px-2.5 py-1 text-xs font-extrabold text-[var(--qb-purple-text)]">
            ADAPTIVE ROUND
          </span>
          <button
            aria-label="Read term"
            onClick={() => speak(card.term, settings)}
          >
            <Volume2 className="size-5 text-muted-foreground" />
          </button>
        </div>
        <h1 className="mt-10 text-[clamp(2rem,6vw,4rem)] font-extrabold tracking-[-.055em]">
          {card.term}
        </h1>
      </section>
      <div className="mt-4 grid gap-3">
        {options.map((option, i) => {
          const correct = option === card.definition;
          const state = selected
            ? correct
              ? 'border-[#6ce5d1] bg-[var(--qb-selected)] text-[var(--qb-teal-text)]'
              : selected === option
                ? 'border-[#ff7b72] bg-[var(--qb-danger-surface)] text-[var(--qb-danger-text)]'
                : 'border-border bg-card opacity-55'
            : 'border-border bg-card hover:border-[#6ce5d1]';
          return (
            <button
              key={option}
              onClick={() => answer(option)}
              className={`flex min-h-16 items-center gap-4 rounded-2xl border-2 p-4 text-left text-sm font-semibold leading-6 transition ${state}`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted font-extrabold">
                {i + 1}
              </span>
              {option}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-5 flex justify-end">
          <Button
            onClick={() => {
              setSelected('');
              setIndex((value) => value + 1);
            }}
            className="bg-[#8c7df7] font-extrabold text-white"
          >
            Next question
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}

function WriteView({
  set,
  settings,
  onExit,
  onReview,
}: {
  set: StudySet;
  settings: AppSettings;
  onExit: () => void;
  onReview: (id: string, result: Mastery) => void;
}) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const card = set.cards[index % set.cards.length];
  const correct = answerMatches(value, card.term, settings.grading);
  const check = () => {
    setChecked(true);
    playTone(settings, correct);
    onReview(card.id, correct ? 3 : 1);
  };
  const next = () => {
    setIndex((i) => i + 1);
    setValue('');
    setChecked(false);
  };
  return (
    <div className="mx-auto max-w-4xl p-4 pb-28 sm:p-8">
      <StudyHeader
        set={set}
        mode="Write"
        progress={(((index % set.cards.length) + 1) / set.cards.length) * 100}
        onExit={onExit}
      />
      <section className="rounded-[26px] border border-border bg-card p-6 sm:p-9">
        <span className="text-xs font-extrabold uppercase tracking-[.14em] text-[#f47bb5]">
          Type the term
        </span>
        <h1 className="mt-8 text-[clamp(1.35rem,4vw,2.2rem)] font-extrabold leading-relaxed">
          {card.definition}
        </h1>
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setChecked(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (checked) next();
              else check();
            }
          }}
          placeholder="Your answer…"
          className="mt-9 h-14 w-full rounded-xl border-2 border-input bg-background px-4 text-lg font-bold outline-none focus:border-[#f47bb5]"
        />
        {checked && (
          <div
            className={`mt-4 rounded-xl p-4 text-sm font-bold ${correct ? 'bg-[var(--qb-selected)] text-[var(--qb-teal-text)]' : 'bg-[var(--qb-danger-surface)] text-[var(--qb-danger-text)]'}`}
          >
            {correct ? (
              'Correct — nice recall.'
            ) : (
              <>
                Not quite. The answer is <strong>{card.term}</strong>.
              </>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setValue(card.term);
              setChecked(true);
            }}
          >
            I don’t know
          </Button>
          <Button
            onClick={() => (checked ? next() : check())}
            className="bg-[#f47bb5] font-extrabold text-[#24101a]"
          >
            {checked ? 'Next' : 'Check answer'}
            <ArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}

function TestView({
  set,
  settings,
  onExit,
  onReview,
}: {
  set: StudySet;
  settings: AppSettings;
  onExit: () => void;
  onReview: (id: string, result: Mastery) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const questions = set.cards;
  const card = questions[index];
  const type = index % 3;
  const choices =
    type === 0
      ? getOptions(set.cards, index, card.definition)
      : type === 1
        ? ['True', 'False']
        : [];
  const trueFalseStatement =
    index % 2 === 0
      ? card.definition
      : questions[(index + 1) % questions.length].definition;
  const expected = (item: Card, i: number) =>
    i % 3 === 1
      ? i % 2
        ? 'False'
        : 'True'
      : i % 3 === 2
        ? item.term
        : item.definition;
  const score = questions.filter((item, i) =>
    answerMatches(answers[item.id] || '', expected(item, i), settings.grading),
  ).length;
  const submit = () => {
    questions.forEach((item, i) =>
      onReview(
        item.id,
        answerMatches(
          answers[item.id] || '',
          expected(item, i),
          settings.grading,
        )
          ? 3
          : 1,
      ),
    );
    setFinished(true);
  };
  if (finished)
    return (
      <div className="mx-auto max-w-4xl p-4 pb-28 sm:p-8">
        <StudyHeader
          set={set}
          mode="Practice test results"
          progress={100}
          onExit={onExit}
        />
        <div className="rounded-[28px] border border-border bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-[#ffc764]" />
          <p className="mt-5 text-5xl font-extrabold">
            {score}/{questions.length}
          </p>
          <h1 className="mt-3 text-2xl font-extrabold">
            Practice test complete
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review missed cards in Learn or Write next.
          </p>
          <Button
            onClick={() => {
              setIndex(0);
              setAnswers({});
              setFinished(false);
            }}
            className="mt-7 bg-[#80a8ff] font-extrabold text-[#0e1725]"
          >
            <RotateCcw /> Try again
          </Button>
        </div>
      </div>
    );
  return (
    <div className="mx-auto max-w-4xl p-4 pb-28 sm:p-8">
      <StudyHeader
        set={set}
        mode="Practice test"
        progress={((index + 1) / questions.length) * 100}
        onExit={onExit}
      />
      <div className="mb-4 flex justify-between text-sm font-bold text-muted-foreground">
        <span>
          {type === 0
            ? 'Multiple choice'
            : type === 1
              ? 'True or false'
              : 'Written response'}
        </span>
        <span>
          {index + 1} of {questions.length}
        </span>
      </div>
      <section className="rounded-[26px] border border-border bg-card p-6 sm:p-9">
        <h1 className="text-2xl font-extrabold leading-relaxed">
          {type === 2
            ? card.definition
            : type === 1
              ? `True or false: “${card.term}” means “${trueFalseStatement}”`
              : `What best matches “${card.term}”?`}
        </h1>
        {choices.length ? (
          <div className="mt-6 grid gap-3">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => setAnswers({ ...answers, [card.id]: choice })}
                className={`rounded-xl border-2 p-4 text-left text-sm font-semibold ${answers[card.id] === choice ? 'border-[#80a8ff] bg-[#80a8ff]/15' : 'border-border bg-background'}`}
              >
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answers[card.id] || ''}
            onChange={(event) =>
              setAnswers({ ...answers, [card.id]: event.target.value })
            }
            className="mt-6 min-h-32 w-full rounded-xl border-2 border-input bg-background p-4 outline-none focus:border-[#80a8ff]"
            placeholder="Type your answer…"
          />
        )}
        <div className="mt-7 flex justify-between">
          <Button
            variant="ghost"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            <ArrowLeft /> Previous
          </Button>
          {index === questions.length - 1 ? (
            <Button
              onClick={submit}
              className="bg-[#80a8ff] font-extrabold text-[#0e1725]"
            >
              Finish test
              <Check />
            </Button>
          ) : (
            <Button
              onClick={() => setIndex((i) => i + 1)}
              className="bg-[#80a8ff] font-extrabold text-[#0e1725]"
            >
              Next
              <ArrowRight />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function MatchView({
  set,
  onExit,
  onReview,
}: {
  set: StudySet;
  onExit: () => void;
  onReview: (id: string, result: Mastery) => void;
}) {
  const pairs = useMemo(
    () => set.cards.slice(0, Math.min(8, set.cards.length)),
    [set.cards],
  );
  const entries = useMemo(
    () =>
      pairs
        .flatMap((card, index) => [
          {
            id: `t-${card.id}`,
            cardId: card.id,
            text: card.term,
            kind: 'term',
            order: index * 2,
          },
          {
            id: `d-${card.id}`,
            cardId: card.id,
            text: card.definition,
            kind: 'definition',
            order: ((index + 3) % pairs.length) * 2 + 1,
          },
        ])
        .sort((a, b) => a.order - b.order),
    [pairs],
  );
  const [selected, setSelected] = useState<(typeof entries)[number] | null>(
    null,
  );
  const [done, setDone] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const pick = (entry: (typeof entries)[number]) => {
    if (done.includes(entry.id)) return;
    if (!selected) {
      setSelected(entry);
      return;
    }
    if (selected.cardId === entry.cardId && selected.kind !== entry.kind) {
      setDone((items) => [...items, selected.id, entry.id]);
      onReview(entry.cardId, 3);
      setSelected(null);
    } else setSelected(entry);
  };
  return (
    <div className="mx-auto max-w-5xl p-4 pb-28 sm:p-8">
      <StudyHeader
        set={set}
        mode="Match"
        progress={(done.length / entries.length) * 100}
        onExit={onExit}
      />
      <div className="mb-4 flex justify-between text-sm font-bold text-muted-foreground">
        <span>Match each term with its definition</span>
        <span className="font-mono text-foreground">
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </span>
      </div>
      {done.length === entries.length ? (
        <div className="rounded-[28px] border border-border bg-card p-10 text-center">
          <Trophy className="mx-auto size-12 text-[#ffc764]" />
          <h1 className="mt-5 text-3xl font-extrabold">
            Board cleared in {seconds}s
          </h1>
          <p className="mt-2 text-muted-foreground">
            Every match improved this set’s mastery.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => pick(entry)}
              className={`min-h-28 rounded-2xl border-2 p-5 text-left text-sm font-semibold leading-6 transition ${done.includes(entry.id) ? 'scale-95 border-[#6ce5d1] bg-[#6ce5d1]/15 opacity-25' : selected?.id === entry.id ? 'border-[#ffc764] bg-[#ffc764]/15' : 'border-border bg-card hover:border-[#596171]'}`}
            >
              {entry.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpeedGame({
  set,
  settings,
  onExit,
  onReview,
  variant,
}: {
  set: StudySet;
  settings: AppSettings;
  onExit: () => void;
  onReview: (id: string, result: Mastery) => void;
  variant: 'rush' | 'meteor';
}) {
  const [seconds, setSeconds] = useState(variant === 'rush' ? 60 : 10);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [value, setValue] = useState('');
  const card = set.cards[index % set.cards.length];
  const over = seconds <= 0;
  useEffect(() => {
    if (over) return;
    const timer = window.setInterval(
      () => setSeconds((value) => value - 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [over, index]);
  const answer = () => {
    const correct =
      answerMatches(value, card.definition, settings.grading) ||
      answerMatches(value, card.term, settings.grading);
    playTone(settings, correct);
    if (correct) {
      setScore((points) => points + (variant === 'rush' ? 100 : 150));
      onReview(card.id, 3);
    } else onReview(card.id, 1);
    setValue('');
    setIndex((item) => item + 1);
    if (variant === 'meteor') setSeconds(10);
  };
  return (
    <div className="mx-auto max-w-4xl p-4 pb-28 sm:p-8">
      <StudyHeader
        set={set}
        mode={variant === 'rush' ? 'Quiz Rush' : 'Meteor'}
        progress={
          variant === 'rush'
            ? ((60 - seconds) / 60) * 100
            : ((10 - seconds) / 10) * 100
        }
        onExit={onExit}
      />
      {over ? (
        <div className="rounded-[28px] border border-border bg-card p-10 text-center">
          <Trophy className="mx-auto size-12 text-[#ffc764]" />
          <p className="mt-5 text-5xl font-extrabold">{score}</p>
          <h1 className="mt-2 text-2xl font-extrabold">
            {variant === 'rush' ? 'Rush complete' : 'Meteor landed'}
          </h1>
          <Button
            onClick={() => {
              setScore(0);
              setIndex(0);
              setSeconds(variant === 'rush' ? 60 : 10);
            }}
            className="mt-7 bg-[#ffc764] font-extrabold text-[#2b200b]"
          >
            <RotateCcw /> Play again
          </Button>
        </div>
      ) : (
        <section className="overflow-hidden rounded-[28px] border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="font-mono text-sm font-extrabold">{seconds}s</span>
            <span className="text-sm font-extrabold text-[#ffc764]">
              {score} points
            </span>
          </div>
          <div className="p-7 sm:p-10">
            <span className="text-xs font-extrabold uppercase tracking-[.14em] text-[#ff9b4a]">
              {variant === 'rush' ? 'Speed definition' : 'Answer before impact'}
            </span>
            <h1 className="mt-7 text-[clamp(2rem,7vw,4.5rem)] font-extrabold tracking-[-.055em]">
              {card.term}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Type the definition or key idea.
            </p>
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && answer()}
              className="mt-8 h-14 w-full rounded-xl border-2 border-input bg-background px-4 text-lg font-bold outline-none focus:border-[#ff9b4a]"
              placeholder="Your answer…"
            />
            <Button
              onClick={answer}
              disabled={!value.trim()}
              className="mt-4 w-full bg-[#ff9b4a] font-extrabold text-[#29170c]"
            >
              Lock answer
              <Zap />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function GuideView({ set, onExit }: { set: StudySet; onExit: () => void }) {
  const concepts = set.cards.slice(0, 8);
  return (
    <div className="mx-auto max-w-5xl p-4 pb-28 sm:p-8">
      <StudyHeader
        set={set}
        mode="Study guide"
        progress={100}
        onExit={onExit}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-.05em]">
            {set.title} guide
          </h1>
          <p className="mt-2 text-muted-foreground">
            A structured review built from all {set.cards.length} cards.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Download /> Print or save PDF
        </Button>
      </div>
      <section className="mt-7 rounded-[24px] border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--qb-selected)] text-[var(--qb-teal-text)]">
            <Lightbulb />
          </span>
          <h2 className="text-xl font-extrabold">Quick summary</h2>
        </div>
        <p className="mt-5 leading-8 text-muted-foreground">
          This set covers {set.subject.toLowerCase()} through {set.cards.length}{' '}
          core ideas. Focus first on{' '}
          {concepts
            .slice(0, 3)
            .map((card) => card.term)
            .join(', ')}
          , then connect the remaining vocabulary with causes, effects,
          examples, and applications.
        </p>
      </section>
      {set.notes && (
        <section className="mt-4 rounded-[24px] border border-border bg-card p-6">
          <h2 className="text-xl font-extrabold">Source notes</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {set.notes}
          </p>
        </section>
      )}
      <section className="mt-4 rounded-[24px] border border-border bg-card p-6">
        <h2 className="text-xl font-extrabold">Key concepts</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {concepts.map((card) => (
            <div
              key={card.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <p className="font-extrabold text-[var(--qb-teal-text)]">
                {card.term}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {card.definition}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-4 rounded-[24px] border border-border bg-card p-6">
        <h2 className="text-xl font-extrabold">Essay & discussion prompts</h2>
        <ol className="mt-5 space-y-3">
          {concepts.slice(0, 5).map((card, index) => (
            <li
              key={card.id}
              className="flex gap-4 rounded-xl bg-background p-4 text-sm leading-6"
            >
              <span className="font-extrabold text-[#8c7df7]">{index + 1}</span>
              Explain {card.term} in your own words, then connect it to another
              idea in this set.
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function LibraryView({
  sets,
  openSet,
  onCreate,
  onDuplicate,
  onDelete,
}: {
  sets: StudySet[];
  openSet: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mx-auto max-w-[1180px] p-4 pb-28 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[var(--qb-teal-text)]">
            Your library
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-[-.06em]">
            Everything you&apos;re learning.
          </h1>
          <p className="mt-2 text-muted-foreground">
            {sets.reduce((sum, set) => sum + set.cards.length, 0)} cards across{' '}
            {sets.length} sets.
          </p>
        </div>
        <Button
          onClick={onCreate}
          className="h-11 bg-[#6ce5d1] font-extrabold text-[#071612]"
        >
          <Plus /> New set
        </Button>
      </div>
      {sets.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sets.map((set) => {
            const mastered = set.cards.filter(
              (card) => card.mastery >= 3,
            ).length;
            return (
              <article
                key={set.id}
                className="overflow-hidden rounded-[24px] border border-border bg-card"
              >
                <button
                  onClick={() => openSet(set.id)}
                  className={`relative block min-h-44 w-full bg-gradient-to-br ${set.color} p-6 text-left text-white`}
                >
                  <span className="rounded-full bg-black/20 px-3 py-1 text-[11px] font-extrabold">
                    {set.subject}
                  </span>
                  <h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-[-.045em]">
                    {set.title}
                  </h2>
                  <p className="mt-2 text-xs font-bold text-white/70">
                    {set.cards.length} cards · {mastered} strong
                  </p>
                </button>
                <div className="p-5">
                  <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                    {set.description}
                  </p>
                  <div className="mt-5 flex items-center gap-2">
                    <Button
                      onClick={() => openSet(set.id)}
                      className="flex-1 bg-foreground font-extrabold text-background"
                    >
                      Open
                    </Button>
                    <Button
                      aria-label="Duplicate set"
                      title="Duplicate set"
                      variant="outline"
                      size="icon"
                      onClick={() => onDuplicate(set.id)}
                    >
                      <Layers3 />
                    </Button>
                    <Button
                      aria-label="Export set"
                      title="Export set"
                      variant="outline"
                      size="icon"
                      onClick={() => downloadJson(`${set.title}.json`, set)}
                    >
                      <Download />
                    </Button>
                    <Button
                      aria-label="Delete set"
                      title="Delete set"
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(set.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-border bg-card p-12 text-center">
          <Library className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-5 text-xl font-extrabold">Your library is ready</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Import vocabulary, paste notes, upload a file, or start from
            scratch.
          </p>
          <Button
            onClick={onCreate}
            className="mt-6 bg-[#6ce5d1] font-extrabold text-[#071612]"
          >
            <Plus /> Create your first set
          </Button>
        </div>
      )}
    </div>
  );
}

function ProgressView({
  sets,
  stats,
  openSet,
}: {
  sets: StudySet[];
  stats: StudyStats;
  openSet: (id: string) => void;
}) {
  const cards = sets.flatMap((set) => set.cards);
  const accuracy = stats.reviews
    ? Math.round((stats.correct / stats.reviews) * 100)
    : 0;
  const buckets = [0, 1, 2, 3, 4].map(
    (mastery) => cards.filter((card) => card.mastery === mastery).length,
  );
  const trouble = sets
    .map((set) => ({
      set,
      count: set.cards.filter((card) => card.mastery < 2).length,
    }))
    .sort((a, b) => b.count - a.count)[0];
  return (
    <div className="mx-auto max-w-[1180px] p-4 pb-28 sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[var(--qb-teal-text)]">
        Learning analytics
      </p>
      <h1 className="mt-2 text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-[-.06em]">
        Progress you can act on.
      </h1>
      <p className="mt-2 text-muted-foreground">
        Every review, game, and practice test updates mastery.
      </p>
      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          value={String(stats.streak)}
          label="Day streak"
          sub="Keep the habit moving"
          color="#ffc764"
        />
        <Metric
          value={`${accuracy}%`}
          label="Accuracy"
          sub={`${stats.correct} of ${stats.reviews} reviews correct`}
          color="#6ce5d1"
        />
        <Metric
          value={formatDuration(stats.seconds)}
          label="Time studied"
          sub={`${stats.xp} XP earned`}
          color="#8c7df7"
        />
        <Metric
          value={String(cards.filter((card) => card.mastery >= 3).length)}
          label="Cards strong"
          sub={`of ${cards.length} total cards`}
          color="#80a8ff"
        />
      </section>
      <section className="mt-5 rounded-[24px] border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">Study activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Last 22 weeks · brighter means more reviews
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            less&nbsp; ▪ ▪ ▪ ▪ &nbsp;more
          </span>
        </div>
        <div className="mt-6 grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
          {Array.from({ length: 154 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (153 - index));
            const dateKey = date.toISOString().slice(0, 10);
            const reviews = stats.activity[dateKey] ?? 0;
            const value =
              reviews === 0
                ? 0
                : reviews < 3
                  ? 1
                  : reviews < 6
                    ? 2
                    : reviews < 10
                      ? 3
                      : 4;
            const colors = [
              'bg-muted',
              'bg-[#284d49]',
              'bg-[#287f74]',
              'bg-[#38bba8]',
              'bg-[#6ce5d1]',
            ];
            return (
              <span
                key={index}
                title={`${reviews} ${reviews === 1 ? 'review' : 'reviews'} on ${dateKey}`}
                className={`size-3 rounded-[3px] ${colors[value]}`}
              />
            );
          })}
        </div>
      </section>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-[24px] border border-border bg-card p-6">
          <h2 className="text-xl font-extrabold">Mastery across every set</h2>
          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-muted">
            {buckets.map((count, index) => (
              <span
                key={index}
                style={{
                  width: `${cards.length ? (count / cards.length) * 100 : 0}%`,
                  background: masteryColor(index as Mastery),
                }}
              />
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {buckets.map((count, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: masteryColor(index as Mastery) }}
                />
                <span className="font-bold">
                  {masteryName(index as Mastery)}
                </span>
                <span className="ml-auto text-muted-foreground">
                  {count} ·{' '}
                  {cards.length ? Math.round((count / cards.length) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[24px] border border-border bg-card p-6">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--qb-purple-surface)] text-[var(--qb-purple-text)]">
            <Target />
          </span>
          <h2 className="mt-5 text-xl font-extrabold">Best next move</h2>
          {trouble ? (
            <>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                <strong className="text-foreground">{trouble.set.title}</strong>{' '}
                has {trouble.count} new or learning cards. An adaptive Learn
                round will prioritize them.
              </p>
              <Button
                onClick={() => openSet(trouble.set.id)}
                className="mt-6 w-full bg-[#8c7df7] font-extrabold text-white"
              >
                Open this set
                <ArrowRight />
              </Button>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Create a set to begin tracking mastery.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[.16em] text-muted-foreground">
        {title}
      </p>
      <div className="overflow-hidden rounded-[22px] border border-border bg-card px-5 sm:px-6">
        {children}
      </div>
    </section>
  );
}

function SettingRow({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border py-5 last:border-0 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-extrabold">{title}</p>
        <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
          {copy}
        </p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Choice<T extends string>({
  value,
  values,
  onChange,
}: {
  value: T;
  values: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-xl bg-muted p-1">
      {values.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`rounded-lg px-3 py-2 text-xs font-extrabold capitalize transition ${value === item ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={`relative h-7 w-12 rounded-full transition ${value ? 'bg-[#6ce5d1]' : 'bg-muted'}`}
    >
      <span
        className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${value ? 'left-6' : 'left-1'}`}
      />
    </button>
  );
}

function SettingsView({
  settings,
  setSettings,
  state,
  onRestore,
  onReset,
}: {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  state: StoredState;
  onRestore: (state: StoredState) => void;
  onReset: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const patch = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings({ ...settings, [key]: value });
  const restore = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as StoredState;
      if (!Array.isArray(parsed.sets)) throw new Error('Invalid backup');
      onRestore(parsed);
    } catch {
      window.alert('That file is not a valid Quizbuddy backup.');
    }
    event.target.value = '';
  };
  return (
    <div className="mx-auto max-w-4xl space-y-7 p-4 pb-28 sm:p-8">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[var(--qb-teal-text)]">
          Preferences
        </p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-[-.06em]">
          Make it yours.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your sets, settings, and progress stay in this browser unless you
          export them.
        </p>
      </div>
      <SettingsSection title="Appearance">
        <SettingRow
          title="Theme"
          copy="Use light, dark, or follow your device."
        >
          <Choice
            value={settings.theme}
            values={['light', 'dark', 'system'] as const}
            onChange={(value) => patch('theme', value)}
          />
        </SettingRow>
      </SettingsSection>
      <SettingsSection title="Studying">
        <SettingRow
          title="Daily goal"
          copy="How many reviews you want to complete each day."
        >
          <input
            type="number"
            min={1}
            value={settings.dailyGoal}
            onChange={(event) =>
              patch('dailyGoal', Math.max(1, Number(event.target.value) || 1))
            }
            className="h-10 w-24 rounded-xl border border-border bg-background px-3 font-bold"
          />
        </SettingRow>
        <SettingRow
          title="New cards per Learn round"
          copy="Shapes the size of an adaptive session. It never limits how many cards you can create or import."
        >
          <input
            type="number"
            min={1}
            value={settings.newCardsPerSession}
            onChange={(event) =>
              patch(
                'newCardsPerSession',
                Math.max(1, Number(event.target.value) || 1),
              )
            }
            className="h-10 w-24 rounded-xl border border-border bg-background px-3 font-bold"
          />
        </SettingRow>
        <SettingRow
          title="Typed answer grading"
          copy="Strict requires a close match; lenient accepts the key idea."
        >
          <Choice
            value={settings.grading}
            values={['strict', 'normal', 'lenient'] as const}
            onChange={(value) => patch('grading', value)}
          />
        </SettingRow>
        <SettingRow
          title="Default prompt side"
          copy="Choose what appears first in Flashcards."
        >
          <Choice
            value={settings.promptSide}
            values={['term', 'definition'] as const}
            onChange={(value) => patch('promptSide', value)}
          />
        </SettingRow>
      </SettingsSection>
      <SettingsSection title="Sound & accessibility">
        <SettingRow
          title="Answer sounds"
          copy="Play a short tone after an answer."
        >
          <Toggle
            value={settings.sounds}
            onChange={(value) => patch('sounds', value)}
            label="Answer sounds"
          />
        </SettingRow>
        <SettingRow
          title="Read cards aloud"
          copy="Use your device voice for study prompts."
        >
          <Toggle
            value={settings.readAloud}
            onChange={(value) => patch('readAloud', value)}
            label="Read cards aloud"
          />
        </SettingRow>
        <SettingRow
          title="Speech rate"
          copy="Change how quickly cards are spoken."
        >
          <div className="flex items-center gap-3">
            <input
              aria-label="Speech rate"
              type="range"
              min="0.6"
              max="1.6"
              step="0.05"
              value={settings.speechRate}
              onChange={(event) =>
                patch('speechRate', Number(event.target.value))
              }
            />
            <span className="w-10 font-mono text-xs font-bold text-muted-foreground">
              {settings.speechRate.toFixed(2)}
            </span>
          </div>
        </SettingRow>
      </SettingsSection>
      <SettingsSection title="Your data">
        <SettingRow
          title="Back up everything"
          copy={`${state.sets.length} sets, ${state.sets.reduce((sum, set) => sum + set.cards.length, 0)} cards, plus progress and preferences.`}
        >
          <Button
            variant="outline"
            onClick={() => downloadJson('quizbuddy-backup.json', state)}
          >
            <Download /> Export JSON
          </Button>
        </SettingRow>
        <SettingRow
          title="Restore a backup"
          copy="Import a Quizbuddy JSON file on this device."
        >
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => void restore(event)}
            />
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              <Upload /> Choose file
            </Button>
          </>
        </SettingRow>
        <SettingRow
          title="Start over"
          copy="Delete every local set, all progress, and restore default preferences."
        >
          <Button
            variant="outline"
            className="border-[#713844] text-[#ff7b72]"
            onClick={onReset}
          >
            <Trash2 /> Reset app
          </Button>
        </SettingRow>
      </SettingsSection>
      <p className="text-center text-xs text-muted-foreground">
        Quizbuddy · local-first · no ads · no account · no paywall
      </p>
    </div>
  );
}

type CoachMessage = { role: 'coach' | 'student'; text: string };

function coachReply(prompt: string, set: StudySet) {
  const clean = prompt.toLowerCase();
  const found =
    set.cards.find((card) => clean.includes(card.term.toLowerCase())) ??
    set.cards.find((card) =>
      card.term
        .toLowerCase()
        .split(/\s+/)
        .some((word) => word.length > 4 && clean.includes(word)),
    );
  if (clean.includes('quiz')) {
    const target = [...set.cards].sort((a, b) => a.mastery - b.mastery)[0];
    return `Quick check: what is ${target.term}? Say it in your own words, then use the definition to check yourself.`;
  }
  if (clean.includes('compare') && set.cards.length > 1) {
    const [first, second] = set.cards;
    return `${first.term} means ${first.definition} By contrast, ${second.term} means ${second.definition} A strong answer should name the relationship between them, not only repeat both definitions.`;
  }
  if (clean.includes('plan') || clean.includes('study')) {
    const trouble = set.cards
      .filter((card) => card.mastery < 2)
      .slice(0, 4)
      .map((card) => card.term);
    return `Start with ${trouble.join(', ') || 'your newest cards'}. Do one Learn round, answer the same ideas in Write, then finish with a short Test. That moves from recognition to recall.`;
  }
  const target = found ?? set.cards[0];
  return `${target.term}: ${target.definition} Try explaining it without looking, add one concrete example, and connect it to another term in ${set.title}.`;
}

function StudyCoach({
  open,
  setOpen,
  set,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  set: StudySet;
}) {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: 'coach',
      text: `I’m grounded in all ${set.cards.length} cards from “${set.title}.” Ask for an explanation, comparison, quiz, or study plan.`,
    },
  ]);
  const [value, setValue] = useState('');
  useEffect(
    () =>
      setMessages([
        {
          role: 'coach',
          text: `I’m grounded in all ${set.cards.length} cards from “${set.title}.” Ask for an explanation, comparison, quiz, or study plan.`,
        },
      ]),
    [set.id, set.cards.length, set.title],
  );
  const send = (prompt = value) => {
    const clean = prompt.trim();
    if (!clean) return;
    setMessages((items) => [
      ...items,
      { role: 'student', text: clean },
      { role: 'coach', text: coachReply(clean, set) },
    ]);
    setValue('');
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col border-border bg-[var(--qb-field-strong)] sm:max-w-md">
        <SheetHeader>
          <div className="mb-2 grid size-11 place-items-center rounded-2xl bg-[var(--qb-purple-surface)] text-[var(--qb-purple-text)]">
            <BrainCircuit />
          </div>
          <SheetTitle className="text-xl font-extrabold">
            Quizbuddy Coach
          </SheetTitle>
          <SheetDescription>
            No key needed. Responses stay grounded in your current set.
          </SheetDescription>
        </SheetHeader>
        <div className="thin-scrollbar flex-1 space-y-3 overflow-y-auto py-5">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[88%] rounded-2xl p-4 text-sm leading-6 ${message.role === 'student' ? 'ml-auto bg-[#6ce5d1] text-[#071612]' : 'bg-card text-foreground'}`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            'Quiz me',
            'Explain the first term',
            'Compare two ideas',
            'Make a study plan',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => send(prompt)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-extrabold text-muted-foreground hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
        <SheetFooter className="mt-4 block">
          <div className="flex gap-2">
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about this set…"
              rows={2}
              className="min-h-12 flex-1 resize-none rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-[#8c7df7]"
            />
            <Button
              aria-label="Send"
              size="icon"
              onClick={() => send()}
              className="mt-1 bg-[#8c7df7] text-white"
            >
              <ArrowRight />
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function MobileNav({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
}) {
  const items = [
    { id: 'home' as Mode, label: 'Home', icon: Home },
    { id: 'studio' as Mode, label: 'Create', icon: Plus },
    { id: 'library' as Mode, label: 'Library', icon: Library },
    { id: 'progress' as Mode, label: 'Progress', icon: BarChart3 },
  ];
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-border bg-[var(--qb-mobile)]/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setMode(id)}
          className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-extrabold ${mode === id ? 'bg-[#6ce5d1] text-[#071612]' : 'text-[#7f8896]'}`}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function downloadJson(filename: string, value: unknown) {
  const safeName = filename.replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-');
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function shareSet(set: StudySet) {
  const preview = set.cards
    .slice(0, 8)
    .map((card) => `${card.term} — ${card.definition}`)
    .join('\n');
  const text = `${set.title}\n${set.cards.length} cards · ${set.subject}\n\n${preview}${set.cards.length > 8 ? '\n…' : ''}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: set.title, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    window.alert('A preview of this set was copied to your clipboard.');
  } catch {}
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function QuizbuddyApp() {
  const [sets, setSets] = useState<StudySet[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<StudyStats>(DEFAULT_STATS);
  const [activeSetId, setActiveSetId] = useState('');
  const [mode, setMode] = useState<Mode>('home');
  const [query, setQuery] = useState('');
  const [coachOpen, setCoachOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [systemLight, setSystemLight] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<StoredState>;
        if (Array.isArray(parsed.sets)) setSets(parsed.sets);
        if (parsed.settings)
          setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
        if (parsed.stats) setStats({ ...DEFAULT_STATS, ...parsed.stats });
        if (typeof parsed.activeSetId === 'string')
          setActiveSetId(parsed.activeSetId);
      }
    } catch {}
    const media = window.matchMedia('(prefers-color-scheme: light)');
    setSystemLight(media.matches);
    const listen = (event: MediaQueryListEvent) =>
      setSystemLight(event.matches);
    media.addEventListener('change', listen);
    setHydrated(true);
    return () => media.removeEventListener('change', listen);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sets,
        settings,
        stats,
        activeSetId,
      } satisfies StoredState),
    );
  }, [sets, settings, stats, activeSetId, hydrated]);

  const light =
    settings.theme === 'light' || (settings.theme === 'system' && systemLight);
  useEffect(() => {
    document.documentElement.classList.toggle('light', light);
  }, [light]);
  const activeSet =
    sets.find((set) => set.id === activeSetId) ?? sets[0] ?? null;
  const openSet = (id: string) => {
    setActiveSetId(id);
    setMode('set');
  };
  const createSet = (set: StudySet) => {
    setSets((items) => [set, ...items]);
    setActiveSetId(set.id);
    setMode('set');
  };
  const saveSet = (next: StudySet) => {
    setSets((items) =>
      items.some((set) => set.id === next.id)
        ? items.map((set) => (set.id === next.id ? next : set))
        : [next, ...items],
    );
    setActiveSetId(next.id);
    setMode('set');
  };
  const updateCard = (id: string, patch: Partial<Card>) => {
    if (!activeSet) return;
    setSets((items) =>
      items.map((set) =>
        set.id === activeSet.id
          ? {
              ...set,
              updatedAt: Date.now(),
              cards: set.cards.map((card) =>
                card.id === id ? { ...card, ...patch } : card,
              ),
            }
          : set,
      ),
    );
  };
  const recordReview = (id: string, result: Mastery) => {
    if (!activeSet) return;
    const current = activeSet.cards.find((card) => card.id === id);
    const correct = result >= 2;
    updateCard(id, {
      mastery: result,
      correct: (current?.correct ?? 0) + (correct ? 1 : 0),
      wrong: (current?.wrong ?? 0) + (correct ? 0 : 1),
    });
    const today = new Date().toISOString().slice(0, 10);
    setStats((value) => ({
      ...value,
      reviews: value.reviews + 1,
      correct: value.correct + (correct ? 1 : 0),
      seconds: value.seconds + 12,
      xp: value.xp + (correct ? 10 : 3),
      activity: {
        ...value.activity,
        [today]: (value.activity[today] ?? 0) + 1,
      },
    }));
  };
  const duplicateSet = (id: string) => {
    const source = sets.find((set) => set.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: makeId('set'),
      title: `${source.title} copy`,
      cards: source.cards.map((card) => ({ ...card, id: makeId('card') })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSets((items) => [copy, ...items]);
    setActiveSetId(copy.id);
  };
  const deleteSet = (id: string) => {
    const target = sets.find((set) => set.id === id);
    if (
      !target ||
      !window.confirm(
        `Delete “${target.title}”? This can’t be undone unless you exported a backup.`,
      )
    )
      return;
    setSets((items) => items.filter((set) => set.id !== id));
    if (activeSetId === id)
      setActiveSetId(sets.find((set) => set.id !== id)?.id ?? '');
  };
  const restore = (state: StoredState) => {
    setSets(state.sets);
    setSettings({ ...DEFAULT_SETTINGS, ...state.settings });
    setStats({ ...DEFAULT_STATS, ...state.stats });
    setActiveSetId(state.activeSetId || state.sets[0]?.id || '');
  };
  const reset = () => {
    if (
      !window.confirm(
        'Clear every local set and all progress? Export a backup first if you want to keep your work.',
      )
    )
      return;
    setSets([]);
    setSettings({ ...DEFAULT_SETTINGS });
    setStats({ ...DEFAULT_STATS, activity: {} });
    setActiveSetId('');
    setMode('home');
  };

  const view = (() => {
    if (mode === 'home')
      return (
        <HomeView
          sets={sets}
          stats={stats}
          settings={settings}
          setMode={setMode}
          openSet={openSet}
        />
      );
    if (mode === 'studio') return <StudioView onCreate={createSet} />;
    if (mode === 'library')
      return (
        <LibraryView
          sets={sets}
          openSet={openSet}
          onCreate={() => setMode('studio')}
          onDuplicate={duplicateSet}
          onDelete={deleteSet}
        />
      );
    if (mode === 'progress')
      return <ProgressView sets={sets} stats={stats} openSet={openSet} />;
    if (mode === 'settings')
      return (
        <SettingsView
          settings={settings}
          setSettings={setSettings}
          state={{ sets, settings, stats, activeSetId }}
          onRestore={restore}
          onReset={reset}
        />
      );
    if (!activeSet) return <StudioView onCreate={createSet} />;
    if (mode === 'edit')
      return (
        <EditorView
          set={activeSet}
          onSave={saveSet}
          onCancel={() => setMode('set')}
        />
      );
    if (mode === 'guide')
      return <GuideView set={activeSet} onExit={() => setMode('set')} />;
    if (!activeSet.cards.length)
      return (
        <SetView
          set={activeSet}
          setMode={setMode}
          onEdit={() => setMode('edit')}
          onToggleStar={(id) =>
            updateCard(id, {
              starred: !activeSet.cards.find((card) => card.id === id)?.starred,
            })
          }
        />
      );
    if (mode === 'flashcards')
      return (
        <FlashcardsView
          set={activeSet}
          settings={settings}
          onExit={() => setMode('set')}
          onReview={recordReview}
          onToggleStar={(id) =>
            updateCard(id, {
              starred: !activeSet.cards.find((card) => card.id === id)?.starred,
            })
          }
        />
      );
    if (mode === 'learn')
      return (
        <LearnView
          set={activeSet}
          settings={settings}
          onExit={() => setMode('set')}
          onReview={recordReview}
        />
      );
    if (mode === 'test')
      return (
        <TestView
          set={activeSet}
          settings={settings}
          onExit={() => setMode('set')}
          onReview={recordReview}
        />
      );
    if (mode === 'write')
      return (
        <WriteView
          set={activeSet}
          settings={settings}
          onExit={() => setMode('set')}
          onReview={recordReview}
        />
      );
    if (mode === 'match')
      return (
        <MatchView
          set={activeSet}
          onExit={() => setMode('set')}
          onReview={recordReview}
        />
      );
    if (mode === 'rush' || mode === 'meteor')
      return (
        <SpeedGame
          key={mode}
          set={activeSet}
          settings={settings}
          onExit={() => setMode('set')}
          onReview={recordReview}
          variant={mode}
        />
      );
    return (
      <SetView
        set={activeSet}
        setMode={setMode}
        onEdit={() => setMode('edit')}
        onToggleStar={(id) =>
          updateCard(id, {
            starred: !activeSet.cards.find((card) => card.id === id)?.starred,
          })
        }
      />
    );
  })();

  return (
    <div
      className={`${light ? 'light ' : ''}quizbuddy-app min-h-screen bg-background font-sans text-foreground`}
    >
      <Sidebar
        mode={mode}
        sets={sets}
        activeSetId={activeSet?.id ?? ''}
        setMode={setMode}
        openSet={openSet}
      />
      <div className="min-h-screen lg:pl-[260px]">
        <Topbar
          query={query}
          setQuery={setQuery}
          sets={sets}
          light={light}
          setLight={(value) =>
            setSettings({ ...settings, theme: value ? 'light' : 'dark' })
          }
          setMode={setMode}
          openSet={openSet}
        />
        <main>{view}</main>
      </div>
      {activeSet && (
        <>
          <Button
            onClick={() => setCoachOpen(true)}
            className="fixed bottom-20 right-4 z-20 h-12 rounded-full bg-[#8c7df7] px-5 font-extrabold text-white shadow-[0_18px_50px_rgba(0,0,0,.32)] lg:bottom-6 lg:right-6"
          >
            <MessageCircle /> Study coach
          </Button>
          <StudyCoach open={coachOpen} setOpen={setCoachOpen} set={activeSet} />
        </>
      )}
      <MobileNav mode={mode} setMode={setMode} />
    </div>
  );
}
