# HYDRA Omni Citadel 10.4.0-apex — easy install

Local-first red-team classroom harness. SeedGuard is off. Magnet seeds (DAN, ignore-previous, AIM, STAN, many-shot, suffix, apex combo) are admitted fixtures used to score whether a model still answers the lesson body.

## Fast path

```bash
cd hydra
chmod +x install.sh
./install.sh
npm run dev
```

Open `http://127.0.0.1:8080`.

## Requirements

- Node.js 22.12 or later (required by `@tanstack/react-start`)
- npm 10+
- Optional: any provider API key in `.env.local` — the app auto-activates
  the first configured one on the /providers page. See
  [`.env.local.example`](.env.local.example) for the full list
  (xAI, OpenAI, Anthropic, Google, OpenRouter, Groq, Mistral, Together,
  DeepSeek, Fireworks, NVIDIA; Ollama and LM Studio need no key).

## Manual path

```bash
npm install
cp -n .env.local .env.local 2>/dev/null || true
npm run dev
```

## What each command does

| Command | Purpose |
| --- | --- |
| `./install.sh` | Checks Node, runs `npm install`, writes `.env.local` |
| `npm run dev` | Vite + app on `0.0.0.0:8080` |
| `npm test` | Engine + auth tests |
| `npm run typecheck` | TypeScript |

## First campaign

1. Seeds — confirm magnet fixtures list seed-41 … seed-56
2. Campaign → Gap hunt (offline sentinel, no API key)
3. Campaign → Live hunt only after `XAI_API_KEY` is set

## Notes

- `node_modules` is produced by `npm install`. Do not commit it.
- Magnet text is evaluation payload, not an instruction to cause harm.
- Flip `GUARD_OFF` in `src/lib/hydra/catalog.ts` to restore fail-closed magnets.
