# Afterparty

A game night for friends and family. Host Ballpark, Bluff Battle, and Guess Who on a shared screen while everyone plays on their phones. Convex synchronizes live rooms. A **Demo mode** toggle in setup keeps the original browser-local simulated cast available without a backend.

## Live setup

The supplied development deployment is configured in ignored `.env.local`. `.env.example` documents the variables. `VITE_CONVEX_URL` is the public client endpoint; `CONVEX_DEPLOY_KEY` is used only by the CLI and must never have a `VITE_` prefix.

```sh
npm install
npm run convex:push
npm run dev
```

1. Open **Host a game night**, leave **Demo mode** off, choose the lineup and room capacity, then **Open lobby**.
2. The lobby chooses the computer's Wi-Fi address for its QR code. Check **App address** if your computer has multiple adapters. Phones must use the same Wi-Fi and the computer must allow incoming traffic to Vite's printed port.
3. Scan with the phone's native Camera app, open the link, and enter a name. Alternatively open `/join` and enter the six-digit code. No in-app camera permission is needed. Customize your avatar on the waiting screen.
4. At least four phones must join. Click **Start night**, then start practice or the scored game. The host controls phase changes, pauses, extra time, fallbacks and reveals. Phones submit answers and votes; the TV has no host controls.
5. **Open TV display** opens a separate display capability. Host controls stay on the original browser. Reloading a phone restores its saved seat; accepted answers and scores live in Convex. Drafts stay in that phone's local storage.

The existing frontend is hosted at https://partygames-puce.vercel.app. `vercel.json` configures Vite and serves deep links such as `/join`, `/setup` and `/room` through `index.html`. Any Vercel preview URL or custom domain uses its own current origin for QR links; saved local addresses and `VITE_PUBLIC_APP_URL` cannot override a hosted domain. Players can join over any internet connection. Locally, Wi-Fi address selection and optional `VITE_PUBLIC_APP_URL` still work.

The tracked `.env.production` contains only public Convex endpoints, so a clean GitHub/Vercel build connects to the supplied deployment without copying `.env.local`. Hosting environment variables can override these public defaults. Keep `CONVEX_DEPLOY_KEY` in local or host secrets only. Convex does not host the frontend; the `.convex.site` URL is reserved for HTTP actions, while live gameplay uses `.convex.cloud`.

Rooms expire after 24 hours. Room mutations check host/player capabilities and current round/phase; clients cannot submit for another player or award scores. Questions, private submissions, author identities and pre-release scores are filtered on the server. Live snapshots do not replace the saved demo. Timers run on Convex, so hiding the host tab does not pause the room; use **Pause** explicitly.

```sh
npm test
npm run build
npm run test:live
npm run test:hosted
```

`test:live` needs a running Vite server, Chrome, and the configured Convex deployment. Set `PREVIEW_URL` and `CHROMIUM_PATH` if needed. It creates an expiring test room and checks a host, TV and four isolated phone browser contexts through all three games. The remaining sections describe the local demo and shared rules.

## Run

Use Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. `npm run build` produces the production bundle.

## Play a night

1. Open setup and turn **Demo mode** on. Pick a three-round quick tour, a nine-round game night, or a custom lineup.
2. Choose the pace, cast size (4–24), packs, and order. Setup flags prompt shortages. Repeated prompts require an explicit opt-in.
3. Open the lobby, edit names and characters, and **Start night**.
4. Each game has a short, skippable, unscored practice using the real controls. Your phone explains your private task. Other players auto-play without overwriting your answer.
5. The host controls reveals and next-round timing. Games flow into one another, then into a finale with calculated highlights, game stamps, and rematch options.

Desktop **Together** combines a dominant shared stage, a 340px player controller, and host controls. Smaller screens use **Your phone / Shared screen / Host controls** role tabs. Dedicated Host, Player, TV, and fullscreen views remain available.

**Preview** changes whose perspective you see. **Take control** explicitly changes the manual participant. Merely previewing someone does not change roles, inputs, or auto-play eligibility.

## Games and scores

- **Ballpark:** everyone estimates a finite number. Estimates stay editable until time or host closure. Accuracy = `round(900 × max(0, 1 − abs(estimate − answer) / tolerance))`. Every tied closest estimate receives 100 additional round points. Zero, negative, decimal, equal, and extreme estimates are supported.
- **Bluff Battle:** three rotating writers supply bluffs. Other players select and lock the truth from four consistently ordered choices. A correct guess earns 500; each fooled voter earns the author 250. Duplicate bluffs and truth matches are rejected privately after case/whitespace normalization. Explicit system fallbacks earn no author reward.
- **Guess Who:** everyone writes; the server selects one submitted answer anonymously. Everyone except the selected author identifies them. Voters cannot select themselves. A correct identity earns the base (default 300), with speed points only in competitive mode. The author earns up to 500 according to the proportion of wrong accepted guesses in the frozen participant roster.

Baseline accuracy streaks remain: the second consecutive success adds 100, then 200, then at most 300. Writing roles preserve streaks without inventing correctness bonuses. Least-used writing roles rotate across games and rematches; a short night does not guarantee everyone a writing turn.

**Round points**, **game total**, and **championship score** are distinct. Championship adds capped normalized per-game averages, at most 1,000 per game and 3,000 overall. Its change can be negative after a weaker round despite positive round points. Personal results explain components and the signed change. Ties share ranks and closest bonuses.

Scores commit atomically at reveal, once per attempt, before the synchronized stage/phone result cue. Showing results early, refreshing, and replaying cannot award again. Practice, skipped attempts, and unscored replays do not enter the scored ledger. **Void & replace** restores the prior score snapshot and retains the voided record.

## Hosting and recovery

One application clock drives the round, simulation, and reveal. Pause stops clock, simulation, and input while retaining drafts and accepted answers. Leaving play or hiding the tab pauses the night. Refresh restores an explicit **Resume demo** action.

At zero, inputs close; the host decides when to reveal. Add 10 seconds when needed. Comfortable mode removes timed pressure and speed rewards. Ballpark reveal duration is bounded independently of cast size; its number line groups equal estimates and preserves actual distances.

Ordinary host controls hide private roles/answers. **Show spoilers** explicitly enables moderation. Missing required writers can receive a marked unscored fallback or a replacement prompt. Roster removal preserves the current round and applies to the next attempt.

## Demo tools

The visible drawer includes nine labelled synthetic scenarios: First night, Quick tour, Write a bluff, Be the secret author, Big party, Close finish, Waiting on one player, Player returns, and Comfortable mode. Scenario replacement explains its consequence before confirmation.

Tools include deterministic seed, auto-play, response overrides, author selection before an answer exists, simulated disconnect/reconnect, closest ties, extreme estimates, long legacy answers, unscored replay, void-and-replace, result export, and demo reset. Explicit overrides may replace accepted inputs; ordinary auto-play never does. These are local synthetic tests, not real-network tests.

## Questions and preferences

The library retains search, pack/category filters, enable/disable, editor, preview, duplicate, delete, JSON export and validated import. Import previews replacement counts. Active rounds retain frozen prompts; edits apply to future attempts.

The starter selection excludes more personal old Guess Who prompts and changing numerical facts. Six comfortable new prompts provide fresh rematch content. Imported tone metadata is preserved. Hosts choose content suitable for their group; no age-rating claim is made.

Settings hold sound (off by default), optional haptics, reduced motion, and future-round Guess Who scoring. Session rules live in setup. System reduced motion is respected, and one application owner produces audio. Character choice and rate-limited cosmetic reactions never affect scores.

## Architecture and saves

| Source | Responsibility |
| --- | --- |
| `src/engine.ts` | Pure validation, scores, questions, and tie-aware ranking |
| `src/session/model.ts` | Session contracts, role projections, breakdowns, setup validation |
| `src/session/store.ts` | Session commands, ledger, clock, recovery, scenarios, versioned save |
| `src/session/simulation.ts` | Seeded validated responses and stable choice order |
| `src/components/night/` | Player, stage, host, results, standings, controls |
| `src/pages/NightStart.tsx` | Start, setup, game discovery |
| `src/pages/NightSession.tsx` | Lobby, introductions, play, transitions, finale |
| `src/demo/Tools.tsx` | Review tools outside simulated product surfaces |
| `src/night.css`, `DESIGN.md` | Implemented visual and interaction system |
| `src/store.ts` | Preserved library/preferences and legacy save migration |

`afterparty-night` stores the versioned session separately from the original `afterparty-v1` library/preferences. Migration preserves custom questions, settings, and older prototype scores; historical scores remain inspectable on Start. Storage failures leave in-memory play usable and explain save failure. Local projections are a UX boundary, not security: all secrets exist in this browser.

The previous gameplay components remain as regression/reference code; the new session flow owns the application routes.

## Routes

| Route | Experience |
| --- | --- |
| `/`, `/dashboard` | Start/resume and game discovery |
| `/setup` | Length, pace, itinerary, packs, cast size |
| `/dashboard/games` | Rules and single-game setup |
| `/dashboard/questions` | Question library/editor |
| `/dashboard/settings` | Personal preferences/scoring defaults |
| `/lobby`, `/demo` | Current night, from cast to finale |
| `/play` | Focused player preview |
| `/display` | Shared display/fullscreen |
| `/leaderboard` | Current standings/final results |
| `/join?room=123456` | Real phone joining via code or QR |
| `/room?room=123456&role=host` | Live host (requires this browser's saved host capability) |
| `/room?room=123456&role=player` | Live personal phone controller |
| `/room?room=123456&role=display&key=...` | Shared TV using a read-only display capability |

## Verification

```sh
npm test
npm run build
npm run test:browser
```

Browser checks require a running Vite server and Chrome/Chromium. Windows uses installed Chrome; other systems use Playwright Chromium. Set `CHROMIUM_PATH` for another executable and `PREVIEW_URL` for another preview URL. `test:experience` runs the demo browser suite; `test:live` runs the real Convex multiplayer suite. `npm run capture:night` regenerates screenshots in an isolated browser context.

The browser suite exercises a real practice and three-game tour, estimate updates, phase actions, private roles, preview/control, pause, refresh, mobile role tabs, drafts, dialogs, and axe scans. It checks eleven routes at 320, 390, 768, 1100, and 1440px. Unit tests cover nine-round nights, scoring/replay/void, simulation exclusions, eligibility, persistence, migration, rematches, and 4/8/24-person reveals.

See `QA.md` for observations, `IMPLEMENTATION.md` for delivery against the plan, and `UX-REDESIGN-PLAN.md` for the original proposal. Physical-device cameras/haptics/keyboards, assistive technology, living-room viewing distance, formative party tests and public frontend hosting remain future validation/work.

## Art

Original eight-character sticker artwork was generated with the built-in imagegen tool and saved in `public/art/cast-stickers.png`. The exact prompt and cell mapping are in `public/art/README.md`. Plus Jakarta Sans is bundled under its included SIL Open Font License. Runtime assets are local.
