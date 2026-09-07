# quizbuddy

Quizbuddy is an open-source AI study workspace that turns notes, readings, and papers into flashcards, practice tests, games, and guided tutoring.

[Open the live app](https://quizbuddy-study.timmylightson.chatgpt.site) · [Report an issue](https://github.com/timlightson/quizbuddy/issues)

## What it includes

- File, pasted-note, and topic-based study set creation
- AI-generated flashcards with an editable local fallback
- Flashcards, adaptive learn, practice test, and matching modes
- A study-set-aware AI tutor
- Progress, mastery, streak, and library views
- Responsive dark and light interfaces with no ads or premium gates
- Cloudflare D1/R2-ready persistence and file storage

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The app can create sets from pasted text without an API key. To enable model-generated cards and tutor responses, add an OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
```

## Stack

Next.js-compatible Vinext, React, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, Cloudflare D1/R2, and the OpenAI Responses API.

## Contributing

Issues and pull requests are welcome. Keep changes focused, run the build and linter, and never commit secrets or student material.

## License

MIT
