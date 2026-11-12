# Afterparty

A complete browser-local party game prototype built with React 19, Vite, TypeScript, Tailwind CSS v4, Radix/shadcn-style UI primitives, Motion, Lucide, React Router, and Zustand. No accounts, database, API keys, environment variables, or backend services.

## Run

Use Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

Open the Vite URL (normally http://localhost:5173). To verify the production bundle: `npm run build`.

## The fastest way to play

1. Click **Launch Demo** on the homepage. It creates 14 players and starts Bluff Battle.
2. In `/demo`, choose **TV**, **Mobile**, **Split**, or **Host** preview.
3. Click **Advance phase** twice to skip instructions and countdown.
4. Play on the phone, then click **Simulate answers** to fill everyone else's submissions.
5. For Bluff Battle and Guess Who, advance to voting and click **Simulate votes**.
6. Click **Reveal answers**, then **Award points**, then **Next round**.
7. **Complete game & podium** simulates and scores the current round and opens the ceremony. To play every configured round, use Next round instead.

Change the party-size input and click **Create N-player party** to replace the roster. This resets scores. All three games support 4–24 simulated participants. The normal join flow is never required.

## Games

- **Bluff Battle:** Three rotating bluffers write lies; all other connected players vote on four answers. Correct guesses earn 500; each fooled voter earns the bluff author 250. Roles rotate in blocks of three, giving every player exactly three bluffer roles over 14 rounds. The real answer's position depends on the deterministic answer order.
- **Guess Who:** The secret author answers privately. Others identify them from the roster. Correct identity earns 300 plus a banded speed bonus: 200 within 5 seconds, 150 within 10, 75 within 20. The author earns up to 500 based on the proportion fooled. Configure base points and maximum speed bonus in Settings. Authors cannot vote, and voters cannot guess themselves. Skip changes the question without exposing the author. The host can choose the author during writing and remove inappropriate submissions in Host preview.
- **Ballpark:** Everyone submits a finite number and can edit until the timer ends. Accuracy points = `900 × max(0, 1 − abs(estimate − answer) / tolerance)`, rounded. Closest estimates earn 100 extra; ties receive the full bonus. An explicit per-question tolerance handles zero, negatives, years, and vastly different scales. The reveal includes a number line, all estimates, and calculated points.

Simulation uses these same submission and scoring functions. Existing human submissions are preserved. For overrides, select a player, enter the value and response time, and apply it during writing/voting. The mobile preview updates the same store as the TV. Set a player's connection state to test offline behavior. Votes and nonnumeric answers lock after submission; the demo override intentionally permits editing for testing.

## Championship

Raw scores accumulate separately per game. Championship points sum each game's average round score, normalized against a 500-point baseline for Bluff Battle and Guess Who, and 1,000 for Ballpark. Each game contributes at most 1,000 championship points, so longer games cannot dominate by round count alone. An average can decrease after a poor round. Tied scores share a rank. Rankings show previous positions, point changes, leader, and biggest climber. Repeated reveals do not award the same round twice. Restarting a round creates a new playable attempt; previously awarded points remain until Reset championship.

## Routes

| Route                  | Experience                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| `/`                    | Homepage, instant 14-player demo                                  |
| `/dashboard`           | Host overview, game cards, roster, recent rounds                  |
| `/dashboard/games`     | Game library and rules overview                                   |
| `/dashboard/questions` | Question packs and complete question editor                       |
| `/dashboard/settings`  | Timers, rounds, scoring, audio, motion, defaults                  |
| `/lobby`               | Rename, add, remove, select, reconnect players; individual scores |
| `/display`             | Full-screen TV presentation with host controls below              |
| `/play`                | Mobile player interaction and active player selector              |
| `/leaderboard`         | Championship/per-game rankings and podium                         |
| `/demo`                | Simulation, overrides, previews, round/game controls              |

## Your own questions

Open **Question packs → New question**. Choose a game and fill its fields. Pack names organize the library; categories, search, and pack filters narrow the list. Each question supports edit, preview, duplicate, delete, and enable/disable. Ballpark questions require a finite answer and positive tolerance; sources and explanations are optional. Guess Who questions include guidance, sensitivity, and skip settings.

Use **Export** for a portable JSON array; import that array to replace the library after validation. Duplicate IDs and invalid question formats are rejected. Select the question pack in Demo before starting a game. A running round keeps a snapshot of its question; edits apply to future rounds. **Settings → Restore default questions & settings** restores 28 starter questions, including 15 numerical questions.

## Persistence and architecture

- `src/engine.ts`: Types, question data, validation, explicit phase transitions, role rotation, scoring, and tie-aware rankings. Pure functions; no React or storage.
- `src/simulation.ts`: Reproducible fake submissions/votes using the engine's validation and rules. Existing answers are never silently overwritten.
- `src/store.ts`: State/action boundary, championship aggregation, configuration, local persistence adapter via Zustand middleware. UI components call actions rather than localStorage.
- `src/components/Gameplay.tsx`: Coordinated TV, phone, podium, score animation, and result charts.
- `src/components/Host.tsx`, `ui.tsx`, `Art.tsx`: Shared host components, Radix Slot/CVA button primitive, original SVG illustrations.
- `src/pages/`: Individual host and demo experiences.
- `src/sound.ts`: Original procedural Web Audio effects initialized after interaction.

All runtime fonts and illustrations are local. Plus Jakarta Sans is distributed under the included SIL Open Font License. Motion respects system and application reduced-motion settings. Inputs, focus styles, dialogs, and primary workflows were reviewed against Vercel's Web Interface Guidelines.

To introduce Convex later, replace the store's local command/persistence adapter with server mutations and reactive room subscriptions. Retain the pure engine on the server for authoritative validation and scoring. Replace simulated identities with room-scoped participant IDs and move timers to server deadlines. TV/mobile components can keep their existing state/action contracts. Real multiplayer needs authorization and private per-player projections; the local store deliberately contains all demo secrets.

## Tests and screenshots

```bash
npm test
npm run build
```

The 15 tests cover scoring, phases, fair role rotation, bluff attribution, identity validation, speed bands, zero/negative/year numerical answers, closest ties, ranking ties, invalid submissions, starter question validation, deterministic 14-player simulation, actual mobile/store identity guessing, overrides, and cross-game championship scoring.

Optional browser suite, with the dev server running:

```bash
npx playwright-core install chromium
npm run test:browser
```

If Chromium is already installed, point `CHROMIUM_PATH` at it for this optional test only. No environment variable is needed to run the app. Browser QA covers every route, all three games with 14 players, score awards, refresh persistence, custom question creation, mobile input, and desktop/mobile overflow. It saves screenshots to `screenshots/`.

## Prototype limits

This is a deterministic local simulation, not network multiplayer. Separate devices do not share a room. Browser tabs on the same origin synchronize via storage events; the visible tab drives the timer. Timers stop accepting answers at zero; the host advances writing/voting to preserve reveal control. Countdown advances automatically. There is no background processing while the browser is closed. Sound effects are lightweight synthesized tones. No AI question generation, real authentication, QR requirement, infrastructure setup, or deployment is included.

## Streamlined live gameplay

The player screen has a compact name/score header, question, answer field and submit action. Connection status appears only on failure. TV timers use an animated progress ring and a final-five-second pulse. The TV has no footer or host controls; use `/demo` for phase control and player selection.

Only the first round includes instructions. Subsequent rounds go straight from standings to the next question. Live standings show as many top players as fit comfortably (up to eight); the full roster remains on `/leaderboard`. Rankings animate from previous positions, expand briefly, settle, and count updated points.

Correct streaks earn +100 on the second success, +200 on the third, and +300 thereafter. A wrong or missing eligible answer resets the streak; author/bluffer turns preserve it without awarding a streak bonus. Ballpark qualifies when its accuracy score is at least 675/900. The real bonus appears in round points, leaderboard badges, and animated phone results.

Ballpark submissions arrive as compact player chips from the centre. Its reveal starts with an empty number line, pans and zooms through estimates from furthest to closest at 1.1 seconds per estimate, then animates the correct answer. Reduced motion shows the final result immediately. No duplicate points table is shown beneath the results.

Run `npm run test:live` with the dev server and Chromium installed for the 24-player fit, staged numerical reveal, streak scoring and streamlined phone regression checks.
