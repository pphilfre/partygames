# Verification

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
