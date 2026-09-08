# quizbuddy

Quizbuddy is an open-source, local-first study workspace for building unlimited flashcards from finished vocabulary, notes, readings, and papers.

[Open the live app](https://quizbuddy-study.timmylightson.chatgpt.site) · [Report an issue](https://github.com/timlightson/quizbuddy/issues)

## What it includes

- Unlimited term/definition import from tabs, commas, dashes, colons, `::`, CSV, TSV, or JSON
- Local PDF, DOCX, TXT, Markdown, CSV, TSV, and JSON file reading
- Notes-to-study-pack conversion with the original source notes preserved
- A full editable set builder with bulk append, reorder, star, duplicate, export, and backup
- Flashcards, adaptive Learn, mixed practice tests, Write, Match, Meteor, and Quiz Rush
- Study guides, a set-grounded no-key study coach, text-to-speech, and answer sounds
- Progress, mastery, streak, activity, library, theme, and grading settings
- Responsive dark/light UI with no ads, accounts, card caps, or premium gates

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. No account or API key is required. Sets and progress are stored in the browser; use Settings → Export JSON to move or back up your library.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
```

## Stack

Next.js-compatible Vinext, React, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, and Cloudflare D1/R2-ready hosting.

## Contributing

Issues and pull requests are welcome. Keep changes focused, run the build and linter, and never commit secrets or student material.

## License

MIT
