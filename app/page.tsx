/* eslint-disable next/no-html-link-for-pages -- Vinext's Link shim currently duplicates React during hydration. */
'use client';

import { useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Check,
  GitFork,
  Layers3,
  MessageCircle,
  Play,
  Sparkles,
  Trophy,
  Upload,
  WandSparkles,
  Zap,
} from 'lucide-react';

const previewCards = [
  {
    term: 'Mitochondria',
    definition:
      'The organelle that produces most usable cellular energy through respiration.',
  },
  {
    term: 'Ribosome',
    definition: 'The structure that assembles amino acids into proteins.',
  },
  {
    term: 'Cell membrane',
    definition:
      'A selectively permeable boundary controlling what enters and leaves a cell.',
  },
  {
    term: 'Osmosis',
    definition:
      'The diffusion of water across a selectively permeable membrane.',
  },
];

const studyModes = [
  {
    icon: Layers3,
    title: 'Flashcards',
    copy: 'Clean, editable cards generated from the material you actually need to know.',
    tone: 'bg-[#183b37] text-[#70e7d2]',
  },
  {
    icon: BrainCircuit,
    title: 'Adaptive learn',
    copy: 'Short recall loops focus your time on weak terms instead of repeating everything.',
    tone: 'bg-[#302958] text-[#b7adff]',
  },
  {
    icon: BookOpenCheck,
    title: 'Practice tests',
    copy: 'Turn any set into quick quizzes with multiple-choice and written questions.',
    tone: 'bg-[#1d3150] text-[#8ab5ff]',
  },
  {
    icon: Zap,
    title: 'Study games',
    copy: 'Race the clock, match concepts, and make another review session feel less repetitive.',
    tone: 'bg-[#4a351c] text-[#ffd175]',
  },
];

function Brand() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center rounded-xl bg-[#6ce5d1] text-[#071612] shadow-[0_0_0_5px_rgba(108,229,209,.08)]">
        <BrainCircuit className="size-5" strokeWidth={2.5} />
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-[#090b10] bg-[#8c7df7]" />
      </span>
      <span className="text-xl font-extrabold tracking-[-.055em] text-white">
        quizbuddy
      </span>
    </span>
  );
}

function ProductPreview() {
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = previewCards[cardIndex];
  const move = (step: number) => {
    setCardIndex(
      (current) => (current + step + previewCards.length) % previewCards.length,
    );
    setFlipped(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-[610px]">
      <div className="absolute -inset-10 rounded-full bg-[#6ce5d1]/10 blur-[90px]" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#11141a] p-3 shadow-[0_35px_100px_rgba(0,0,0,.55)] sm:p-4">
        <div className="flex items-center gap-2 border-b border-white/8 px-2 pb-3 text-[11px] text-[#7f8795]">
          <span className="size-2 rounded-full bg-[#ff786d]" />
          <span className="size-2 rounded-full bg-[#ffc764]" />
          <span className="size-2 rounded-full bg-[#6ce5d1]" />
          <span className="ml-3 font-bold">Cell Biology Essentials</span>
          <span className="ml-auto rounded-full bg-[#1e252d] px-2 py-1 text-[#6ce5d1]">
            74% mastered
          </span>
        </div>
        <div className="grid gap-3 pt-3 sm:grid-cols-[145px_1fr]">
          <div className="hidden rounded-2xl bg-[#171a20] p-3 sm:block">
            {['Overview', 'Flashcards', 'Learn', 'Practice test', 'Match'].map(
              (item, i) => (
                <div
                  key={item}
                  className={`mb-1.5 rounded-lg px-3 py-2.5 text-[11px] font-bold ${i === 1 ? 'bg-[#262b34] text-[#6ce5d1]' : 'text-[#717987]'}`}
                >
                  {item}
                </div>
              ),
            )}
          </div>
          <div>
            <div className="grid grid-cols-3 gap-2">
              {['Flashcards', 'Learn', 'Test'].map((item, i) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/8 bg-[#1a1e25] px-2 py-3 text-center text-[10px] font-bold text-[#b8bfca]"
                >
                  <span
                    className={`mx-auto mb-1.5 block size-2 rounded-full ${['bg-[#6ce5d1]', 'bg-[#8c7df7]', 'bg-[#80a8ff]'][i]}`}
                  />
                  {item}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFlipped((value) => !value)}
              aria-label={`${flipped ? 'Show term for' : 'Show definition for'} ${card.term}`}
              className="group mt-2.5 flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-[#363d49] bg-[#252a35] p-8 text-center transition hover:-translate-y-0.5 hover:border-[#6ce5d1]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ce5d1]"
            >
              <span className="rounded-lg bg-[#343a47] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.13em] text-[#aeb5c2]">
                {flipped ? 'Definition' : 'Term'}
              </span>
              <p
                key={`${cardIndex}-${flipped ? 'back' : 'front'}`}
                className={`rise mt-8 font-extrabold leading-tight text-white ${flipped ? 'text-[clamp(1.2rem,3vw,1.8rem)] tracking-[-.03em]' : 'text-[clamp(1.75rem,5vw,3.2rem)] tracking-[-.055em]'}`}
              >
                {flipped ? card.definition : card.term}
              </p>
              <p className="mt-4 text-xs text-[#8b94a3] transition group-hover:text-[#c8ced8]">
                {flipped ? 'Click to see the term' : 'Click to flip'}
              </p>
            </button>
            <div className="mt-3 flex items-center justify-center gap-3 text-xs font-bold text-[#9299a8]">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous demo card"
                className="grid size-8 place-items-center rounded-full bg-[#242933] transition hover:bg-[#303642] hover:text-white"
              >
                ←
              </button>
              <span aria-live="polite">
                {cardIndex + 1} / {previewCards.length}
              </span>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next demo card"
                className="grid size-8 place-items-center rounded-full bg-[#6ce5d1] text-[#071612] transition hover:bg-[#8aedde]"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mt-5 text-center">
        <a
          href="/demo"
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#454c5a] bg-[#171b22] px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:border-[#6ce5d1]/70 hover:bg-[#1e242c]"
        >
          <Play className="size-4 fill-current" /> Explore the full demo
          <ArrowRight className="size-4" />
        </a>
        <p className="mt-2 text-xs font-semibold text-[#697280]">
          Sample workspace · no signup · your real library stays untouched
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090b10] text-[#f6f7fb]">
      <nav className="relative z-20 mx-auto flex h-20 max-w-[1240px] items-center px-5 sm:px-8">
        <Brand />
        <div className="ml-auto hidden items-center gap-7 text-sm font-bold text-[#8f97a5] md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#workflow" className="transition hover:text-white">
            How it works
          </a>
          <a
            href="https://github.com/timlightson/quizbuddy"
            className="transition hover:text-white"
          >
            Open source
          </a>
        </div>
        <a
          href="/study"
          className="ml-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#6ce5d1] px-4 text-sm font-extrabold text-[#071612] transition hover:bg-[#8aedde]"
        >
          Launch app <ArrowRight className="size-4" />
        </a>
      </nav>

      <section className="relative mx-auto grid max-w-[1240px] gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:pb-32 lg:pt-24">
        <div className="pointer-events-none absolute -left-48 -top-56 size-[560px] rounded-full bg-[#7c6cf5]/13 blur-[120px]" />
        <div className="rise relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#383f4b] bg-[#171b22] px-3 py-1.5 text-xs font-extrabold text-[#b9c0cb]">
            <Sparkles className="size-3.5 text-[#6ce5d1]" /> Your notes, now
            actually useful
          </div>
          <h1 className="mt-6 max-w-[690px] text-[clamp(3.25rem,7.7vw,6.8rem)] font-extrabold leading-[.88] tracking-[-.075em]">
            Study smarter.
            <br />
            <span className="bg-gradient-to-r from-[#6ce5d1] to-[#9a8cff] bg-clip-text text-transparent">
              Keep it free.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-[1.05rem] leading-8 text-[#9aa2af] sm:text-xl">
            Import finished vocabulary or upload notes, readings, and papers.
            Quizbuddy turns them into unlimited flashcards, guides, tests,
            games, and focused review—without ads or paywalled basics.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/study"
              className="inline-flex h-13 items-center gap-2 rounded-xl bg-[#6ce5d1] px-6 text-base font-extrabold text-[#071612] transition hover:-translate-y-0.5 hover:bg-[#8aedde]"
            >
              <Play className="size-4 fill-current" /> Start studying
            </a>
            <a
              href="https://github.com/timlightson/quizbuddy"
              className="inline-flex h-13 items-center gap-2 rounded-xl border border-[#343a46] bg-[#15181f] px-6 text-base font-extrabold text-white transition hover:-translate-y-0.5 hover:border-[#525a68]"
            >
              <GitFork className="size-4" /> View on GitHub
            </a>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#747d8a]">
            {[
              'No ads',
              'No card limits',
              'No API key',
              'Your material stays yours',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[#6ce5d1]" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <ProductPreview />
      </section>

      <section
        id="workflow"
        className="border-y border-white/8 bg-[#0d1015] px-5 py-24 sm:px-8"
      >
        <div className="mx-auto max-w-[1140px]">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#6ce5d1]">
              From file to focused
            </p>
            <h2 className="mt-3 text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold leading-[.98] tracking-[-.065em]">
              One upload. A whole study system.
            </h2>
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-3">
            {[
              {
                n: '01',
                icon: Upload,
                title: 'Bring anything',
                copy: 'Paste ready-made terms and definitions, or upload a PDF, DOCX, CSV, text file, and more.',
              },
              {
                n: '02',
                icon: WandSparkles,
                title: 'Shape the study pack',
                copy: 'Auto-detect vocabulary or turn notes into a draft, then edit every card without a cap.',
              },
              {
                n: '03',
                icon: Trophy,
                title: 'Make it stick',
                copy: 'Use eight study modes, games, progress tracking, and a coach grounded in your set.',
              },
            ].map(({ n, icon: Icon, title, copy }) => (
              <article
                key={n}
                className="rounded-[24px] border border-white/8 bg-[#15181f] p-6 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#20302f] text-[#6ce5d1]">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs font-bold text-[#4d5562]">
                    {n}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-extrabold tracking-[-.035em]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#8f97a5]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-[1140px] px-5 py-24 sm:px-8 lg:py-32"
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#8c7df7]">
              Built for real review
            </p>
            <h2 className="mt-3 max-w-2xl text-[clamp(2.2rem,5vw,4.4rem)] font-extrabold leading-[.98] tracking-[-.065em]">
              Every way you learn, in one place.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#8f97a5]">
            Start from the same set and switch modes whenever your attention
            needs a reset.
          </p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {studyModes.map(({ icon: Icon, title, copy, tone }) => (
            <article
              key={title}
              className="rounded-[24px] border border-white/8 bg-[#12151b] p-5"
            >
              <span
                className={`grid size-11 place-items-center rounded-2xl ${tone}`}
              >
                <Icon className="size-5" />
              </span>
              <h3 className="mt-7 text-lg font-extrabold tracking-[-.035em]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#8f97a5]">{copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
          <article className="relative overflow-hidden rounded-[28px] border border-[#3b356d] bg-gradient-to-br from-[#242044] to-[#141724] p-7 sm:p-10">
            <MessageCircle className="size-8 text-[#a99eff]" />
            <h3 className="mt-12 max-w-lg text-3xl font-extrabold tracking-[-.055em] sm:text-4xl">
              A study coach that starts with your material.
            </h3>
            <p className="mt-4 max-w-xl leading-7 text-[#aaa8c6]">
              Ask for an explanation, comparison, quick quiz, or study plan. It
              stays anchored to the current set and works without an API key.
            </p>
            <div className="mt-7 inline-flex rounded-xl bg-white/8 px-4 py-3 text-sm font-bold text-[#dcd8ff]">
              “Quiz me on my weakest terms.”
            </div>
          </article>
          <article className="rounded-[28px] border border-[#2f4c49] bg-[#12211f] p-7 sm:p-10">
            <GitFork className="size-8 text-[#6ce5d1]" />
            <h3 className="mt-12 text-3xl font-extrabold tracking-[-.055em]">
              Open source by default.
            </h3>
            <p className="mt-4 leading-7 text-[#91aaa6]">
              Inspect it, improve it, or run it yourself. Quizbuddy is a study
              tool students can help shape.
            </p>
            <a
              href="https://github.com/timlightson/quizbuddy"
              className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#6ce5d1]"
            >
              Explore the code <ArrowRight className="size-4" />
            </a>
          </article>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-[1140px] overflow-hidden rounded-[30px] border border-white/10 bg-[#f4f7f6] px-7 py-14 text-center text-[#10151b] sm:px-12">
          <Sparkles className="mx-auto size-7 text-[#168f81]" />
          <h2 className="mx-auto mt-5 max-w-3xl text-[clamp(2.2rem,5vw,4.6rem)] font-extrabold leading-[.96] tracking-[-.065em]">
            Your next study set is already in your notes.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[#626d73]">
            Bring the material. Quizbuddy will help turn it into something you
            can actually remember.
          </p>
          <a
            href="/study"
            className="mt-8 inline-flex h-13 items-center gap-2 rounded-xl bg-[#11161c] px-6 font-extrabold text-white"
          >
            Build a study set <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-white/8 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 text-sm text-[#747d8a] sm:flex-row sm:items-center">
          <Brand />
          <p className="sm:ml-5">Free, focused, and built in the open.</p>
          <div className="flex gap-5 sm:ml-auto">
            <a href="/study" className="hover:text-white">
              Study app
            </a>
            <a
              href="https://github.com/timlightson/quizbuddy"
              className="hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
