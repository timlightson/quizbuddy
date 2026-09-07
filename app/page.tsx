'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BarChart3, Bell, BookOpen, BrainCircuit, Check,
  CircleHelp, Clock3, Flame, FolderOpen, Gamepad2, Home, Library, ListChecks,
  MessageCircle, Moon, MoreHorizontal, Plus, RotateCcw, Search, Settings, Shuffle,
  Sparkles, Star, Sun, Target, Trophy, Volume2, WandSparkles, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Mode = 'home' | 'library' | 'progress' | 'flashcards' | 'learn' | 'test' | 'match';

type WebMCPTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: WebMCPTool, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

const cards = [
  { term: 'Mitochondria', definition: 'The organelle that produces most of a cell’s usable energy through cellular respiration.', mastery: 92 },
  { term: 'Ribosome', definition: 'A tiny cellular structure where amino acids are assembled into proteins.', mastery: 84 },
  { term: 'Cell membrane', definition: 'A selectively permeable boundary that controls what enters and leaves a cell.', mastery: 78 },
  { term: 'Nucleus', definition: 'The membrane-bound control center that contains a eukaryotic cell’s DNA.', mastery: 91 },
  { term: 'Cytoplasm', definition: 'The gel-like material inside a cell where many chemical reactions occur.', mastery: 65 },
  { term: 'Lysosome', definition: 'An organelle containing enzymes that break down waste and worn-out cell parts.', mastery: 49 },
  { term: 'Golgi apparatus', definition: 'An organelle that modifies, sorts, and packages proteins and lipids.', mastery: 58 },
  { term: 'Endoplasmic reticulum', definition: 'A membrane network involved in protein and lipid production and transport.', mastery: 42 },
];

const modeMeta = [
  { id: 'flashcards' as Mode, label: 'Flashcards', icon: BookOpen, note: 'Flip & recall', color: 'bg-[#e8e5ff] text-[#5144d7]' },
  { id: 'learn' as Mode, label: 'Learn', icon: BrainCircuit, note: 'Adaptive practice', color: 'bg-[#dff5f3] text-[#147d82]' },
  { id: 'test' as Mode, label: 'Practice test', icon: ListChecks, note: '8 questions', color: 'bg-[#fff0d8] text-[#9a5b00]' },
  { id: 'match' as Mode, label: 'Match sprint', icon: Gamepad2, note: 'Beat your best', color: 'bg-[#f7e3ef] text-[#ae3f76]' },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-10 place-items-center rounded-[14px] bg-[#9ed957] text-[#152008] shadow-[inset_0_-3px_0_rgba(30,60,10,.14)]">
        <BrainCircuit className="size-5" strokeWidth={2.4} />
        <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-[#111b31] bg-[#8b80ff]" />
      </div>
      <span className="text-[1.2rem] font-bold tracking-[-.045em] text-white">quizbuddy</span>
    </div>
  );
}

function Sidebar({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const links = [
    { id: 'home' as Mode, label: 'Today', icon: Home },
    { id: 'library' as Mode, label: 'My library', icon: Library },
    { id: 'progress' as Mode, label: 'Progress', icon: BarChart3 },
  ];
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col bg-[#111b31] px-4 py-5 text-[#dfe5f1] lg:flex">
      <div className="px-2"><Brand /></div>
      <Button onClick={() => setMode('library')} className="mt-8 h-11 justify-start gap-2.5 rounded-xl bg-[#9ed957] px-4 font-semibold text-[#17220b] hover:bg-[#b3e879]">
        <Plus className="size-4" /> New study set
      </Button>
      <nav aria-label="Main navigation" className="mt-7 space-y-1">
        {links.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)} className={`flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-left text-[.93rem] font-medium transition ${mode === id ? 'bg-[#29344e] text-white shadow-[inset_3px_0_0_#8b80ff]' : 'text-[#aeb8ca] hover:bg-[#1b2740] hover:text-white'}`}>
            <Icon className="size-[18px]" /> {label}
          </button>
        ))}
      </nav>
      <div className="mt-8 px-3 text-[.7rem] font-bold uppercase tracking-[.16em] text-[#748199]">Study tools</div>
      <nav className="mt-3 space-y-1" aria-label="Study tools">
        {modeMeta.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)} className={`flex h-10 w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm transition ${mode === id ? 'bg-[#29344e] text-white' : 'text-[#aeb8ca] hover:bg-[#1b2740] hover:text-white'}`}>
            <Icon className="size-[17px]" /> {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-[#2b3750] bg-[#18243a] p-3.5">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-[#8b80ff] text-sm font-bold text-white">TM</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">Study mode</p><p className="text-xs text-[#8f9cb1]">Everything unlocked</p></div>
          <Settings className="ml-auto size-4 text-[#7f8ba0]" />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#2a354b]"><div className="h-full w-[72%] rounded-full bg-[#9ed957]" /></div>
        <p className="mt-2 text-xs text-[#8f9cb1]">72% of this week’s goal</p>
      </div>
    </aside>
  );
}

function Topbar({ mode, setMode, dark, setDark }: { mode: Mode; setMode: (m: Mode) => void; dark: boolean; setDark: (v: boolean) => void }) {
  const titles: Record<Mode, string> = { home: 'Today', library: 'My library', progress: 'Progress', flashcards: 'Flashcards', learn: 'Learn', test: 'Practice test', match: 'Match sprint' };
  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="grid size-9 place-items-center rounded-xl bg-[#111b31] text-[#9ed957]"><BrainCircuit className="size-5" /></div>
        <span className="hidden font-bold tracking-tight sm:inline">quizbuddy</span>
      </div>
      <div className="ml-3 hidden h-6 w-px bg-border lg:block" />
      <h1 className="ml-4 hidden text-[1.04rem] font-semibold tracking-tight text-foreground lg:block">{titles[mode]}</h1>
      <div className="relative ml-auto hidden w-full max-w-[380px] md:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input aria-label="Search study sets" placeholder="Search your sets" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-[#8b80ff] focus:ring-4 focus:ring-[#8b80ff]/10" />
      </div>
      <div className="ml-3 flex items-center gap-1.5">
        <Button onClick={() => setDark(!dark)} variant="ghost" size="icon" aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell /><span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-background bg-[#ef6da7]" /></Button>
        <Button onClick={() => setMode('library')} className="ml-1 hidden h-9 rounded-xl bg-[#5c4cf1] px-4 font-semibold text-white hover:bg-[#4c3de0] sm:inline-flex"><Plus /> Create</Button>
      </div>
    </header>
  );
}

function MasteryRing({ value }: { value: number }) {
  return (
    <div className="relative grid size-[88px] place-items-center rounded-full" style={{ background: `conic-gradient(#5c4cf1 ${value * 3.6}deg, #eceef5 0)` }}>
      <div className="grid size-[68px] place-items-center rounded-full bg-card"><span className="text-xl font-bold tracking-tight">{value}%</span></div>
    </div>
  );
}

function StudyModes({ setMode }: { setMode: (m: Mode) => void }) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#7264f4]">Pick your pace</p><h2 className="mt-1 text-xl font-bold tracking-[-.03em]">How do you want to study?</h2></div><button className="text-sm font-semibold text-[#5c4cf1]">See all tools</button></div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {modeMeta.map(({ id, label, icon: Icon, note, color }) => (
          <button key={id} onClick={() => setMode(id)} className="group rounded-2xl border border-border bg-card p-4 text-left shadow-[0_7px_25px_rgba(31,43,68,.045)] transition hover:-translate-y-1 hover:border-[#9c94f7] hover:shadow-[0_12px_30px_rgba(68,57,170,.1)]">
            <div className={`mb-5 grid size-10 place-items-center rounded-xl ${color}`}><Icon className="size-5" /></div>
            <p className="font-semibold tracking-tight">{label}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function HomeView({ setMode }: { setMode: (m: Mode) => void }) {
  return (
    <div className="mx-auto max-w-[1180px] space-y-8 p-4 pb-28 sm:p-7 lg:p-9 lg:pb-10">
      <section className="float-in flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-muted-foreground">Monday, September 7</p><h2 className="mt-1 text-[clamp(1.65rem,3vw,2.4rem)] font-bold tracking-[-.055em]">Ready for a quick win?</h2><p className="mt-1 text-[.98rem] text-muted-foreground">You have <span className="font-semibold text-foreground">12 cards</span> due today. About 8 minutes.</p></div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#eadfb9] bg-[#fffaf0] px-4 py-3 text-[#81500b] dark:border-[#5b4521] dark:bg-[#2e2515] dark:text-[#f5c975]"><Flame className="size-5 fill-[#ffbc57] text-[#e89418]" /><div><p className="text-sm font-bold">9 day streak</p><p className="text-xs opacity-70">Your best is 14</p></div></div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.7fr)]">
        <div className="relative overflow-hidden rounded-[26px] bg-[#171f38] p-6 text-white shadow-[0_18px_55px_rgba(20,29,55,.18)] sm:p-7">
          <div className="absolute -right-16 -top-24 size-72 rounded-full border-[48px] border-[#5c4cf1]/30" /><div className="absolute -bottom-24 right-28 size-52 rounded-full border-[36px] border-[#9ed957]/15" />
          <div className="relative z-10 flex h-full min-h-[252px] flex-col">
            <div className="flex items-center justify-between"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#cdd5e5]">BIOLOGY · 8 terms</span><Button variant="ghost" size="icon" className="text-[#aeb8ca] hover:bg-white/10 hover:text-white"><MoreHorizontal /></Button></div>
            <div className="mt-8 max-w-xl"><p className="text-sm font-medium text-[#9ed957]">Continue where you left off</p><h3 className="mt-2 text-[clamp(1.6rem,3vw,2.35rem)] font-bold tracking-[-.045em]">Cell Biology Essentials</h3><p className="mt-2 max-w-lg text-sm leading-6 text-[#aeb8ca]">Your memory is strongest on cell structures. Two organelles need another look.</p></div>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-7"><Button onClick={() => setMode('learn')} className="pulse-soft h-11 rounded-xl bg-[#9ed957] px-5 font-bold text-[#16210a] hover:bg-[#b1e873]"><Zap className="fill-current" /> Continue learning</Button><Button onClick={() => setMode('flashcards')} variant="ghost" className="h-11 rounded-xl border border-white/15 px-4 text-white hover:bg-white/10"><BookOpen /> Review cards</Button><span className="ml-auto text-xs text-[#8c98ad]">Last studied 2h ago</span></div>
          </div>
        </div>

        <div className="rounded-[26px] border border-border bg-card p-6 shadow-[0_8px_30px_rgba(31,43,68,.055)]">
          <div className="flex items-start justify-between"><div><p className="text-sm font-semibold">Set mastery</p><p className="mt-1 text-xs text-muted-foreground">Up 8% this week</p></div><MasteryRing value={74} /></div>
          <div className="mt-8 space-y-4">
            {[['Mastered', '3', 'bg-[#9ed957]'], ['Learning', '3', 'bg-[#5c4cf1]'], ['New', '2', 'bg-[#d9dce5]']].map(([label, value, color]) => <div key={label} className="flex items-center gap-3 text-sm"><span className={`size-2.5 rounded-full ${color}`} /><span className="text-muted-foreground">{label}</span><span className="ml-auto font-bold tabular-nums">{value}</span></div>)}
          </div>
          <div className="mt-7 rounded-xl bg-muted/60 p-3.5"><div className="flex items-center gap-2 text-xs font-semibold"><Sparkles className="size-4 text-[#5c4cf1]" /> Smart review</div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Best time to revisit: today at 7:30 PM</p></div>
        </div>
      </section>

      <StudyModes setMode={setMode} />

      <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-border bg-card p-5"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#147d82]">Memory map</p><h2 className="mt-1 text-lg font-bold tracking-tight">Terms to sharpen</h2></div><Target className="size-5 text-[#5c4cf1]" /></div><div className="space-y-4">{cards.slice(5).map(card => <button key={card.term} onClick={() => setMode('flashcards')} className="grid w-full grid-cols-[minmax(0,1fr)_96px_34px] items-center gap-3 text-left"><span className="truncate text-sm font-medium">{card.term}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#5c4cf1]" style={{width:`${card.mastery}%`}} /></div><span className="text-right text-xs font-semibold tabular-nums text-muted-foreground">{card.mastery}%</span></button>)}</div></div>
        <div className="rounded-2xl border border-[#d7d2ff] bg-[#f4f2ff] p-5 dark:border-[#3a3569] dark:bg-[#201d3c]"><div className="grid size-10 place-items-center rounded-xl bg-[#5c4cf1] text-white"><WandSparkles className="size-5" /></div><h2 className="mt-5 text-lg font-bold tracking-tight">Ask your AI tutor</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Get a hint, a simpler explanation, or a fresh example—without leaving your deck.</p><Button onClick={() => setMode('learn')} className="mt-5 h-10 w-full rounded-xl bg-[#5c4cf1] font-semibold text-white"><MessageCircle /> Start a study chat</Button></div>
      </section>
    </div>
  );
}

function FlashcardsView({ setMode }: { setMode: (m: Mode) => void }) {
  const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false); const [starred, setStarred] = useState<number[]>([]);
  const current = cards[index];
  const move = (n: number) => { setIndex((index + n + cards.length) % cards.length); setFlipped(false); };
  return (
    <div className="mx-auto max-w-5xl p-4 pb-28 sm:p-8">
      <div className="mb-6 flex items-center gap-3"><Button onClick={() => setMode('home')} variant="ghost" size="icon"><ArrowLeft /></Button><div><p className="text-xs font-semibold uppercase tracking-wider text-[#5c4cf1]">Cell Biology Essentials</p><h2 className="text-xl font-bold">Flashcards</h2></div><span className="ml-auto text-sm font-semibold text-muted-foreground">{index + 1} / {cards.length}</span></div>
      <Progress value={(index + 1) / cards.length * 100} className="mb-7 [&_[data-slot=progress-indicator]]:bg-[#5c4cf1]" />
      <button onClick={() => setFlipped(!flipped)} className="group relative flex min-h-[390px] w-full items-center justify-center overflow-hidden rounded-[28px] border border-border bg-card p-10 text-center shadow-[0_18px_55px_rgba(31,43,68,.09)] transition hover:border-[#a29af6] sm:min-h-[460px]">
        <div className="absolute left-6 top-6 rounded-full bg-muted px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{flipped ? 'Definition' : 'Term'}</div>
        <Star onClick={(e) => { e.stopPropagation(); setStarred(s => s.includes(index) ? s.filter(i => i !== index) : [...s, index]); }} className={`absolute right-6 top-6 size-6 ${starred.includes(index) ? 'fill-[#ffbc57] text-[#e79c24]' : 'text-muted-foreground'}`} />
        <p className={`${flipped ? 'max-w-2xl text-[clamp(1.3rem,3vw,2rem)] leading-relaxed' : 'text-[clamp(2.1rem,7vw,4.2rem)]'} font-bold tracking-[-.045em] transition`}>{flipped ? current.definition : current.term}</p>
        <span className="absolute bottom-6 text-xs font-medium text-muted-foreground">Click the card to {flipped ? 'see the term' : 'flip'}</span>
      </button>
      <div className="mt-6 flex items-center justify-center gap-3"><Button variant="outline" size="icon-lg" onClick={() => setIndex(Math.floor(Math.random()*cards.length))} aria-label="Shuffle"><Shuffle /></Button><Button variant="outline" size="icon-lg" onClick={() => move(-1)} aria-label="Previous"><ArrowLeft /></Button><Button onClick={() => setFlipped(!flipped)} className="h-12 min-w-40 rounded-xl bg-[#5c4cf1] text-base font-bold text-white"><RotateCcw /> Flip card</Button><Button variant="outline" size="icon-lg" onClick={() => move(1)} aria-label="Next"><ArrowRight /></Button><Button variant="outline" size="icon-lg" aria-label="Read aloud"><Volume2 /></Button></div>
    </div>
  );
}

function LearnView({ setMode }: { setMode: (m: Mode) => void }) {
  const [index, setIndex] = useState(0); const [answer, setAnswer] = useState(''); const [feedback, setFeedback] = useState<'idle'|'right'|'try'>('idle');
  const card = cards[index];
  const check = () => setFeedback(answer.trim().toLowerCase().includes(card.term.toLowerCase()) ? 'right' : 'try');
  const next = () => { setIndex((index+1)%cards.length); setAnswer(''); setFeedback('idle'); };
  return <div className="mx-auto max-w-4xl p-4 pb-28 sm:p-8"><div className="mb-6 flex items-center gap-3"><Button onClick={() => setMode('home')} variant="ghost" size="icon"><ArrowLeft /></Button><div><p className="text-xs font-semibold uppercase tracking-wider text-[#147d82]">Adaptive session</p><h2 className="text-xl font-bold">Learn</h2></div><span className="ml-auto rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">+20 XP</span></div><Progress value={(index+1)/cards.length*100} className="mb-8 [&_[data-slot=progress-indicator]]:bg-[#37b6c7]" /><section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_55px_rgba(31,43,68,.07)] sm:p-10"><div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><BrainCircuit className="size-4 text-[#37b6c7]" /> Type the term</div><p className="mt-8 text-[clamp(1.25rem,3vw,1.75rem)] font-semibold leading-relaxed tracking-tight">{card.definition}</p><input value={answer} onChange={e=>{setAnswer(e.target.value);setFeedback('idle')}} onKeyDown={e=>e.key==='Enter'&&check()} placeholder="Your answer…" className="mt-10 h-14 w-full rounded-xl border-2 border-input bg-background px-4 text-lg font-medium outline-none transition focus:border-[#5c4cf1]" />{feedback !== 'idle' && <div className={`mt-4 flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${feedback==='right'?'bg-[#edf8df] text-[#315d0a]':'bg-[#fff0e1] text-[#8c4a08]'}`}>{feedback==='right'?<Check className="size-5"/>:<Sparkles className="size-5"/>}{feedback==='right'?'Exactly right. Nice recall!':<>Almost — the answer is <strong>{card.term}</strong>.</>}</div>}<div className="mt-8 flex items-center justify-between"><Button variant="ghost" className="text-muted-foreground"><CircleHelp /> Give me a hint</Button>{feedback==='right'||feedback==='try'?<Button onClick={next} className="h-11 rounded-xl bg-[#5c4cf1] px-6 font-bold text-white">Next question <ArrowRight /></Button>:<Button onClick={check} disabled={!answer.trim()} className="h-11 rounded-xl bg-[#5c4cf1] px-6 font-bold text-white">Check answer</Button>}</div></section></div>;
}

function TestView({ setMode }: { setMode: (m: Mode) => void }) {
  const [selected, setSelected] = useState<string>('');
  const options = ['A selectively permeable cell boundary', 'A structure that makes proteins', 'The organelle that contains DNA', 'A network that transports lipids'];
  return <div className="mx-auto max-w-4xl p-4 pb-28 sm:p-8"><div className="mb-6 flex items-center gap-3"><Button onClick={()=>setMode('home')} variant="ghost" size="icon"><ArrowLeft/></Button><div><p className="text-xs font-semibold uppercase tracking-wider text-[#9a5b00]">Question 1 of 8</p><h2 className="text-xl font-bold">Practice test</h2></div><div className="ml-auto flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Clock3 className="size-4"/> 09:42</div></div><Progress value={12.5} className="mb-8 [&_[data-slot=progress-indicator]]:bg-[#ffbc57]"/><section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_55px_rgba(31,43,68,.07)] sm:p-10"><span className="rounded-lg bg-[#fff0d8] px-2.5 py-1 text-xs font-bold text-[#9a5b00]">MULTIPLE CHOICE</span><h3 className="mt-6 text-[clamp(1.3rem,3vw,1.8rem)] font-bold tracking-tight">Which best describes the cell membrane?</h3><div className="mt-7 grid gap-3">{options.map((option,i)=><button key={option} onClick={()=>setSelected(option)} className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left text-sm font-medium transition ${selected===option?'border-[#5c4cf1] bg-[#f1efff] dark:bg-[#28244c]':'border-border hover:border-[#b3acf7]'}`}><span className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${selected===option?'bg-[#5c4cf1] text-white':'bg-muted text-muted-foreground'}`}>{String.fromCharCode(65+i)}</span>{option}</button>)}</div><div className="mt-8 flex justify-end"><Button disabled={!selected} className="h-11 rounded-xl bg-[#5c4cf1] px-6 font-bold text-white">Submit answer <ArrowRight/></Button></div></section></div>;
}

function MatchView({ setMode }: { setMode: (m: Mode) => void }) {
  const pairs = cards.slice(0,3); const entries = useMemo(()=>[...pairs.map((c,i)=>({text:c.term,key:i,type:'term'})),...pairs.map((c,i)=>({text:c.definition,key:i,type:'def'}))].sort(()=>.5-Math.random()),[]); const [chosen,setChosen]=useState<number[]>([]); const [done,setDone]=useState<number[]>([]);
  const pick=(i:number)=>{if(done.includes(i)||chosen.includes(i))return;if(chosen.length===0){setChosen([i]);return}const first=entries[chosen[0]];const second=entries[i];if(first.key===second.key&&first.type!==second.type){setDone([...done,chosen[0],i]);setChosen([])}else{setChosen([i])}};
  return <div className="mx-auto max-w-5xl p-4 pb-28 sm:p-8"><div className="mb-6 flex items-center gap-3"><Button onClick={()=>setMode('home')} variant="ghost" size="icon"><ArrowLeft/></Button><div><p className="text-xs font-semibold uppercase tracking-wider text-[#ae3f76]">Personal best 0:42</p><h2 className="text-xl font-bold">Match sprint</h2></div><div className="ml-auto rounded-xl bg-[#171f38] px-4 py-2 font-mono text-lg font-bold text-white">0:00</div></div><p className="mb-6 text-sm text-muted-foreground">Match every term with its definition. Choose two tiles at a time.</p><div className="grid gap-3 sm:grid-cols-2">{entries.map((entry,i)=><button key={`${entry.type}-${entry.key}`} onClick={()=>pick(i)} className={`min-h-28 rounded-2xl border-2 p-5 text-left text-sm font-semibold leading-6 transition ${done.includes(i)?'scale-[.97] border-[#9ed957] bg-[#eef9df] text-[#365b12] opacity-55':chosen.includes(i)?'border-[#5c4cf1] bg-[#efedff] text-[#3e35a0] shadow-lg':'border-border bg-card hover:-translate-y-0.5 hover:border-[#aaa3f5]'}`}>{done.includes(i)&&<Check className="mb-2 size-4"/>}{entry.text}</button>)}</div>{done.length===entries.length&&<div className="mt-6 flex items-center justify-between rounded-2xl bg-[#171f38] p-5 text-white"><div><p className="font-bold">Perfect match!</p><p className="text-sm text-[#aeb8ca]">New personal best unlocked.</p></div><Trophy className="size-8 text-[#ffbc57]"/></div>}</div>;
}

function LibraryView({ setMode }: { setMode: (m: Mode) => void }) {
  const [created,setCreated]=useState(false);
  return <div className="mx-auto max-w-[1100px] p-4 pb-28 sm:p-8"><div className="flex items-end justify-between"><div><p className="text-sm text-muted-foreground">Everything you’re learning, in one place.</p><h2 className="mt-1 text-3xl font-bold tracking-[-.045em]">My library</h2></div><Dialog><DialogTrigger render={<Button className="h-10 rounded-xl bg-[#5c4cf1] px-4 font-bold text-white"/>}><Plus/> New set</DialogTrigger><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Create a study set</DialogTitle><DialogDescription>Paste terms and definitions, one pair per line. Use a tab or dash between them.</DialogDescription></DialogHeader><label className="text-sm font-semibold">Title<input defaultValue="Spanish vocabulary" className="mt-2 h-11 w-full rounded-xl border bg-background px-3 outline-none focus:border-[#5c4cf1]"/></label><label className="text-sm font-semibold">Terms<textarea defaultValue={'hola — hello\ngracias — thank you\nlibro — book'} className="mt-2 min-h-36 w-full resize-none rounded-xl border bg-background p-3 font-mono text-sm outline-none focus:border-[#5c4cf1]"/></label><DialogFooter><Button onClick={()=>setCreated(true)} className="bg-[#5c4cf1] text-white">Create 3 cards</Button></DialogFooter></DialogContent></Dialog></div>{created&&<div className="mt-6 flex items-center gap-3 rounded-xl border border-[#b9dfa0] bg-[#f0f9e8] p-4 text-sm font-semibold text-[#315d0a]"><Check className="size-5"/> Spanish vocabulary was added to your library.</div>}<Tabs defaultValue="sets" className="mt-8"><TabsList variant="line" className="gap-5"><TabsTrigger value="sets">Study sets</TabsTrigger><TabsTrigger value="folders">Folders</TabsTrigger><TabsTrigger value="favorites">Favorites</TabsTrigger></TabsList><TabsContent value="sets" className="mt-6 grid gap-4 sm:grid-cols-2"><button onClick={()=>setMode('flashcards')} className="rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-[#9d95f5] hover:shadow-md"><div className="flex items-center justify-between"><span className="rounded-lg bg-[#e8e5ff] px-2.5 py-1 text-xs font-bold text-[#5144d7]">BIOLOGY</span><MoreHorizontal className="size-5 text-muted-foreground"/></div><h3 className="mt-8 text-lg font-bold">Cell Biology Essentials</h3><p className="mt-1 text-sm text-muted-foreground">8 terms · 74% mastered</p><Progress value={74} className="mt-5 [&_[data-slot=progress-indicator]]:bg-[#5c4cf1]"/></button><button className="rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-[#9d95f5] hover:shadow-md"><div className="flex items-center justify-between"><span className="rounded-lg bg-[#dff5f3] px-2.5 py-1 text-xs font-bold text-[#147d82]">SPANISH</span><MoreHorizontal className="size-5 text-muted-foreground"/></div><h3 className="mt-8 text-lg font-bold">Everyday Spanish</h3><p className="mt-1 text-sm text-muted-foreground">24 terms · 61% mastered</p><Progress value={61} className="mt-5 [&_[data-slot=progress-indicator]]:bg-[#37b6c7]"/></button></TabsContent><TabsContent value="folders" className="mt-6 rounded-2xl border border-dashed p-12 text-center"><FolderOpen className="mx-auto size-8 text-muted-foreground"/><p className="mt-3 font-semibold">Folders keep classes organized</p></TabsContent><TabsContent value="favorites" className="mt-6 rounded-2xl border border-dashed p-12 text-center"><Star className="mx-auto size-8 text-muted-foreground"/><p className="mt-3 font-semibold">Star a set to find it here</p></TabsContent></Tabs></div>;
}

function ProgressView() {
  const days=[38,62,44,82,55,74,68];
  const stats = [{icon:Flame,value:'9 days',label:'Current streak'},{icon:Clock3,value:'3h 42m',label:'Studied this week'},{icon:Trophy,value:'186',label:'Terms mastered'}];
  return <div className="mx-auto max-w-[1100px] p-4 pb-28 sm:p-8"><p className="text-sm text-muted-foreground">Your effort is turning into long-term memory.</p><h2 className="mt-1 text-3xl font-bold tracking-[-.045em]">Progress</h2><div className="mt-8 grid gap-4 sm:grid-cols-3">{stats.map(({icon:Icon,value,label})=><div key={label} className="rounded-2xl border bg-card p-5"><Icon className="size-5 text-[#5c4cf1]"/><p className="mt-5 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>)}</div><div className="mt-5 rounded-2xl border bg-card p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold">Study activity</h3><p className="text-sm text-muted-foreground">Minutes focused this week</p></div><span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">+18%</span></div><div className="mt-10 flex h-52 items-end gap-3 sm:gap-5">{days.map((v,i)=><div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-[#5c4cf1] transition hover:bg-[#7669f4]" style={{height:`${v*2}px`}}/><span className="text-xs text-muted-foreground">{['M','T','W','T','F','S','S'][i]}</span></div>)}</div></div></div>;
}

function MobileNav({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const links = [{icon:Home,id:'home' as Mode,label:'Today'},{icon:Library,id:'library' as Mode,label:'Library'},{icon:BrainCircuit,id:'learn' as Mode,label:'Learn'},{icon:BarChart3,id:'progress' as Mode,label:'Progress'}];
  return <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-white/10 bg-[#111b31]/95 px-2 py-2 text-[#99a5ba] shadow-2xl backdrop-blur lg:hidden">{links.map(({icon:Icon,id,label})=><button key={id} onClick={()=>setMode(id)} className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[.67rem] font-semibold ${mode===id?'bg-[#29344e] text-[#aee66c]':'hover:text-white'}`}><Icon className="size-5"/>{label}</button>)}</nav>;
}

export default function QuizBuddy() {
  const [mode,setMode]=useState<Mode>('home'); const [dark,setDark]=useState(false);
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const studyModes = ['flashcards', 'learn', 'test', 'match'] as const;
    const tool: WebMCPTool = {
      name: 'start_study_session',
      title: 'Start a study session',
      description: 'Open one of quizbuddy’s study modes for the active Cell Biology Essentials set.',
      inputSchema: {
        type: 'object',
        properties: { mode: { type: 'string', enum: studyModes } },
        required: ['mode'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const requested = (input as { mode?: string } | null)?.mode;
        if (!studyModes.includes(requested as typeof studyModes[number])) {
          throw new Error('Choose flashcards, learn, test, or match.');
        }
        setMode(requested as Mode);
        return { status: 'started', mode: requested, set: 'Cell Biology Essentials' };
      },
    };
    try {
      void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {
      // The app remains fully usable when WebMCP is unavailable.
    }
    return () => lifecycle.abort();
  }, []);
  const view = mode==='home'?<HomeView setMode={setMode}/>:mode==='library'?<LibraryView setMode={setMode}/>:mode==='progress'?<ProgressView/>:mode==='flashcards'?<FlashcardsView setMode={setMode}/>:mode==='learn'?<LearnView setMode={setMode}/>:mode==='test'?<TestView setMode={setMode}/>:<MatchView setMode={setMode}/>;
  return <div className={dark?'dark':''}><div className="min-h-screen bg-background text-foreground transition-colors"><Sidebar mode={mode} setMode={setMode}/><div className="lg:pl-[244px]"><Topbar mode={mode} setMode={setMode} dark={dark} setDark={setDark}/><main>{view}</main></div><MobileNav mode={mode} setMode={setMode}/></div></div>;
}
