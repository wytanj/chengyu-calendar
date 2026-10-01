# Brief: chengyu-v1

Build a shippable daily 成语 (chengyu) tear-off calendar for JT's Oppo Find N3 (Android / ColorOS).

## Inspiration
Skeuomorphic Chinese daily desk calendar like ChengYu Calendar (FiachraRM / tear-off page): warm paper texture, red accents, big 4 characters, pinyin, English meaning, short example.
Reference: https://x.com/FiachraRM/status/2105245124037107731

## Product
1. Daily chengyu: 4 characters, pinyin, English meaning (literal + figurative when useful), short example sentence, optional one-line story.
2. Visual: skeuomorphic tear-off calendar — warm paper, red accents, Chinese calendar vibes. Full-width web; responsive for phone.
3. Updates once per day at midnight Asia/Singapore (pick by date hash into pack so same day = same idiom offline).
4. Simplified Chinese default; traditional toggle nice-to-have for v1.
5. Minimal shell: home = today's card; tap → detail (meaning/example/story). Favorites optional skip for v1.
6. Offline-capable: bundle a JSON pack of >=100 idioms (simplified + pinyin + meanings + examples). No network required for daily pick.
7. Ship as installable PWA (manifest + service worker) that works great on ColorOS Chrome/HeyTap browser. Document Oppo N3 "Add to Home screen" steps in README. APK/TWA optional stretch if easy (Capacitor/Bubblewrap); PWA first.

## Stack
Prefer Vite + vanilla or React + TypeScript, static deploy to Vercel. Keep deps light. No backend required for v1.

## Deliverables (class A)
- Working PWA in this worktree
- Bundled idiom JSON
- README: how to add to Oppo N3 home screen
- Push `loop/chengyu-v1`
- Leave PR title/body in docs/agents/PR.md if gh not authed
- POST done webhook when configured
- Do NOT merge or vercel --prod (outer loop owns Class C)
