Title: feat(calendar): add the daily tear-off page

## Why

The Find N3 needs one 成语 a day on a desk calendar that still opens after the first load. The page hashes the Singapore civil date into the bundled pack, so the same date always shows the same sheet.

## Scope

- `parsePack`, `pickChengyu`, and `singaporeDayKey` in `src/domain.ts`, the 125 entries in `src/pack.json`, and the checks in `test/domain.test.ts`.
- The tear-off sheet in `src/main.ts` and `src/style.css`, plus `public/manifest.webmanifest`, `public/sw.js`, and the Noto Serif SC subset.
- Install steps for Chrome and the preinstalled browser on ColorOS, in `README.md`.
- Deletes `docs/briefs/chengyu-v1.md`. This branch finishes that brief.

## Tradeoffs

The page is Vite and vanilla TypeScript. The pack ships inside the page, and there is no server. Traditional text covers the four characters and the idiom inside the example. The rest of the lesson stays in simplified Chinese and English. An Android package is a later pass.

## Blast Radius

This is the first app on the scaffold. A change to the pack or the hash moves which idiom a later day shows, and `test/domain.test.ts` pins the hash, the sort, and the Singapore midnight boundary. The service worker registers only in the production build. Merge and `vercel --prod` stay outside this branch.

## Verification

`npm test` passed 8 tests. `npm run build` wrote `dist` with Vite 7.3.6. Headless Chrome loaded the preview at `?day=2026-10-01` and at `#detail`. The card showed 色厉内荏 with four glosses. The detail showed the meaning, the example, and the story. `?day=2026-09-06` showed 落井下石, dated 九月六日, Sunday.
