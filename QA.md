# Verification

## Convex live multiplayer · 15 November 2026

- Backend schema/functions deployed to `precious-owl-595` with Convex TypeScript checks passing.
- Production build passes; all 58 unit tests pass. Live engine coverage checks stale phases, locked submissions, pause, atomic awards, practice/rematch, server-side privacy and anonymous vote totals.
- `PREVIEW_URL=http://127.0.0.1:5174 npm run test:live`: passed with a real Convex room, a host, a read-only TV and four isolated mobile browser contexts. Phones joined using the QR link's actual `192.168.1.64` Wi-Fi address over HTTP. Verified roster updates, refresh without duplicate seats, private writing, voting, all three games, scoring, finale, rematch, no browser runtime errors and no horizontal overflow.
- Existing demo browser regression passes through the Demo mode toggle: three-game tour, practice, input updates, pause, score awards, refresh/draft recovery and 11 routes at 320/390/768/1100/1440px. Zero accessibility violations in its tested states.
- Live lobby, avatar waiting screen and phone finale screenshots were visually inspected. Fixed Wi-Fi adapter selection, HTTP token generation and mobile podium margins.
- Deployment credential stays in ignored `.env.local`; the production bundle was checked for the deploy-key name/value prefix and contains neither. The client uses only the public Convex URL.
- The Impeccable detector completed with palette/type-ramp advisories; intended live extensions are documented in DESIGN.md. Its pre-existing design sidecar remains older than that document.
- Physical phone hardware and native camera scanning have not been directly tested. QR generation uses the existing QR library and targets the verified phone join URL. Different-network play additionally requires frontend hosting; Convex is the backend, not the frontend host.

## Reveal and identity update · 15 November 2026

Current checks supersede the earlier screen/copy descriptions below.

- `npm test`: 51 tests pass.
- `npm run build`: TypeScript and production build pass.

- Unit coverage includes 14-person shared writing, selecting exactly one submitted Guess Who quote, rejecting repeat guesses and author votes, fair author selection, and audio transport unlock/mute/phase replacement.
- Manual in-app-browser walkthrough: edited Alex's skin, curls, moustache and glasses; completed a 14-player quick tour across all three games; verified the Ballpark sequence, vote graphs, score count-up and reorder, single selection in Guess Who and animated podium.
- Mobile banner edges were measured against the player-card edges and match. Checked the quieter phone lock screen at 390px.
- Results/podium and the 14-person results list fit at 320, 390, 768, 1100 and 1440px without horizontal overflow.
- Reduced-motion setting verified in the browser: all three podium places and the winner appear immediately; confetti is hidden. Restored the original preference afterward.
- Fresh captures: `screenshots/showtime-podium-desktop.jpg` and `screenshots/showtime-podium-mobile.jpg`.
- Impeccable detector completed with token/type-ramp advisories. Avatar skin/hair and podium medal colours are intentional additions. This pass does not claim a new axe audit, physical-phone QR joining, or human group testing.


## Lobby and game-show correction · 15 November 2026

- `npm test`: 46 passing tests, including five new waiting-room cases for arrivals, four-player minimum, joined-cast freezing, code/name validation, duplicate joins, room locking, manual fill, auto-play off, and compatibility with older saved lobbies.
- `npm run build`: TypeScript and Vite production build pass.
- `PREVIEW_URL=http://127.0.0.1:5180 node scripts/night-qa.cjs`: complete three-game quick tour plus practice, score awards, private host, preview/control ownership, refresh recovery, drafts, mobile role navigation, and all 11 routes at 320, 390, 768, 1100, and 1440px pass. Zero axe violations in its tested states.
- `node scripts/show-qa.cjs`: wrong-code recovery, lock/unlock, manual rejoin, individual arrivals, persisted lobby state, lobby layouts at five widths, all three games' introductions/countdowns/writing/reveals/standings, Bluff voting/controller, Guess Who voting, and finale pass. Before the shared reveal releases, the public-result element remains absent. Zero axe WCAG A/AA violations across the tested lobby, join, writing, voting, and result states.
- Fresh captures live under `screenshots/show-*.png`; the new accessibility report is `screenshots/show-a11y-report.json`. Desktop/mobile lobby, shared/private answer choices, all games' writing/reveal states, and the introduction were visually inspected. Corrected mobile roster layout and moved host Start above the shared screen after inspecting captures.
- The Impeccable mechanical detector was run on the changed interface. It produced design-token/type-ramp advisories; intentional shared-screen colour and scale extensions are recorded in DESIGN.md. Browser contrast checks then passed after darkening the stage wordmark on the new tinted headers.

This verifies the local demo, not real-device joining, a human accessibility audit, or whether groups find it fun. The user's requested rules are preserved; human play sessions remain open.

Verified on 12 November 2026 in Chromium.

- `npm run build`: passes TypeScript and Vite production build.
- `npm test`: 15 tests pass.
- `npm run test:browser`: passes all 10 routes; all three games progress through writing, voting where applicable, reveal, actual score awards, and podium with 14 players.
- Browser checks also cover mobile numeric submission, correctly guessing the secret author, local refresh persistence, custom question creation, and no horizontal overflow at 1440px and 390px.
- axe-core WCAG 2 A/AA audit: zero reported violations on `/dashboard`, `/demo`, `/dashboard/questions`, and `/play` in their tested default states. This automated check does not replace a complete manual accessibility audit.
- Reviewed against Vercel Web Interface Guidelines. Visible focus, native input labels, Radix modal focus management, unsaved question warnings, reduced motion, local fonts, and improved secondary-text contrast are implemented.

The managed preview relay and shared browser tool were unavailable. Browser checks and screenshots were completed using the installed local Chromium runner against Vite.

## Screenshots

- [Homepage](screenshots/00-home.png)
- [Host dashboard](screenshots/01-host-dashboard.png)
- [Bluff Battle reveal](screenshots/02-bluff-reveal.png)
- [Guess Who reveal](screenshots/03-guess-who-reveal.png)
- [Ballpark reveal](screenshots/04-ballpark-reveal.png)
- [Split mobile and TV preview](screenshots/05-mobile-estimate-split.png)
- [Championship podium](screenshots/06-podium.png)
- [Question library](screenshots/07-question-library.png)
- [Mobile Guess Who](screenshots/08-mobile-guess-who.png)
- [Full-screen Ballpark](screenshots/09-tv-ballpark.png)
- [Full-screen podium](screenshots/10-tv-podium.png)
- [Final host dashboard](screenshots/11-final-dashboard.png)

## November 2026 experience redesign

- Production TypeScript/Vite build and all 13 engine tests pass.
- Existing browser flow passes for all three games: host phases, mobile submissions, real scoring, custom questions, and saved state.
- `npm run test:experience`: 40 route/viewport combinations (320, 390, 768, 1440px), mobile navigation, round-driven journey progress, reduced-motion persistence, and haptic opt-out/opt-in pass.
- Axe WCAG A/AA scans at 390px with system reduced motion reviewed all 10 routes in their initial states. Fixed supporting-label contrast, including lobby instructions. No remaining automated violations in those scanned states. This does not replace assistive-technology or hardware testing.
- Updated screenshots 00–08; added 12–14 for mobile Home, Settings, and Lobby.
- Vibration checks stub the browser API; physical feel and native iOS haptics still need device validation.

See `DESIGN-PLAN.md` for research sources, screen changes, interaction vocabulary, and product follow-ups.

## Live UI refinement verification

- 15 engine/store tests pass, including actual streak awards, resets, author exemptions, and direct transitions from standings into the next question.
- `test:live` passes with 24 simulated players: leaderboard rows stay within the TV viewport; the numerical answer remains hidden until the staged reveal ends; duplicate result tables and live footers are absent; phone results show the actual streak bonus.
- The live routes contain only gameplay. Host phase controls and player selection remain in `/demo`.
- Updated screenshots: [Clean Ballpark](screenshots/12-clean-ballpark.png), [Leaderboard](screenshots/13-clean-leaderboard.png), [Phone streak](screenshots/14-phone-streak.png), [Phone Guess Who](screenshots/15-clean-mobile.png).

## Combined main verification

Merged the experience redesign with the live gameplay refinements. Production build, all 15 engine/store tests, `test:live`, `test:experience`, and `test:browser` pass together. Retained the newer live views and streak scoring; consolidated submission sound and vibration under the persisted feedback preferences.

## Implemented game-night flow — 15 November 2026

Earlier entries describe historical versions. The current implementation is verified with:

- Production TypeScript/Vite build.
- Engine/session unit tests for nine-round nights, practice isolation, atomic awards, replay/void, simulation exclusions, pause/deadlines, synchronized results, private roles/skips, roster snapshots, system fallbacks, shortages, recovery, 4/8/24-person reveals, duplicate bluffs, migration, and rematches.
- `scripts/night-qa.cjs`: actual practice and three-game tour, estimate edits, contextual host actions, scoring, finale/stamps, spoiler-safe host, preview/control, refresh, drafts, mobile roles, and dialog dismissal.
- Eleven routes at 320/390/768/1100/1440px without horizontal overflow in tested states.
- Axe WCAG A/AA scans with zero reported violations in tested home/setup/library/settings/results/finale/author/candidate/editor states. This is not an accessibility certification.
- `scripts/night-capture.cjs`: 340px desktop phone verified; all 24 positions fit the resumed 1280×720 TV viewport; desktop/mobile screenshots visually reviewed.
- Mechanical design detector ran once. Only Plus Jakarta Sans warnings remained; that self-hosted family is explicitly selected by the supplied plan.

Checks ran in local Chrome against Vite on port 5174. The preview and browser required the same network permission boundary; final runs used the reachable local preview.

Physical mobile keyboards/haptics, assistive technology, living-room viewing distance, and party sessions with people remain unverified. Local save/restore and simulated disconnects do not establish real-network reconnection behaviour.

Final run: 41 unit tests passed; production build passed; end-to-end browser checks passed with zero automated accessibility findings in the tested states. The independent finish reviewer scored all five requested fixes resolved and returned ship for that fix list. A settled reveal now stops rewriting saved state while the host holds the result.
