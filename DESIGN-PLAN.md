# Afterparty experience redesign

## Direction

Feel welcoming, rewarding, and alive like Duolingo; keep the shared-screen, host-led play loop that makes Kahoot work. Give each screen an obvious next action, consistent navigation, and feedback for meaningful activity. Progress comes from real play, never invented streaks or points.

## Product references reviewed

These are documented product patterns, not a pixel audit of every current app version. Mobile layouts vary by platform and rollout.

| Product | Documented pattern | Application here |
| --- | --- | --- |
| [Duolingo home path](https://blog.duolingo.com/new-duolingo-home-screen-design/) | A clear path helps people choose what to do next. | Three concrete party milestones with live progress and linked next steps. |
| [Duolingo core tabs](https://blog.duolingo.com/core-tabs-redesign/) | Persistent destinations, stronger hierarchy, destination-specific color. | Five labeled mobile tabs: Home, Games, Party, Ranks, You. Question packs have a direct Home link; player and TV views stay focused on gameplay. |
| [Kahoot mobile](https://kahoot.com/home/mobile-app/) and [joining games](https://support.kahoot.com/hc/en-us/articles/115016109368-How-to-join-games-in-Kahoot-app) | Joining is a first-class action; phones act as game controllers, with colorful answer choices. | A dedicated Party tab and large tactile answer cards; host controls, TV, and player view remain distinct. Room FRDY remains a local prototype identifier, not a working remote join service. |
| [Blooket rewards](https://help.blooket.com/hc/en-us/articles/16620459001495-How-to-Earn-Tokens-XP-in-Blooket) | Earned rewards make completed play visible. | Stamps for completing rounds in each game. No currency economy added. |
| [Wayground power-ups](https://help.wayground.com/support/solutions/articles/158000404941-power-ups-their-types) | Game feedback and bonuses add excitement. | Submission pulses, animated scores and reveal celebrations. Power-ups are a future game-design decision because they change fairness and scoring. |

## Screen implementation

| Screen | Changes |
| --- | --- |
| Landing | New expressive mascot, purple/lime identity, stronger entry buttons and game cards. |
| Home | Contextual start/resume action, live session stats, party journey, three-game challenge, and existing roster/standings. |
| Game library | Separate game colors, responsive artwork, tactile play buttons, hover and press feedback. |
| Question packs | Stronger selected states, larger pack cards and editing controls, readable mobile inputs. |
| Lobby | Bold room identity, clearer roster surfaces, larger guest controls and editable names. |
| Championship | Color-highlighted leader, tactile filters, clearer podium and score surfaces. |
| Settings | Readable form layout, independent persisted sound/haptics/motion controls. |
| Demo | Unified control surfaces, larger mobile host actions, clearer preview tabs. |
| Player | Distinct answer colors, raised answer cards, submission feedback, clearer confirmation and round states. |
| TV | Updated answer/reveal surfaces, stronger timer styling; existing animated scores and confetti preserved. |
| All host screens | Persistent five-tab mobile navigation; contextual sidebar on desktop; focus rings and short screen transitions. |

## Feedback vocabulary

| Event | Visual | Haptic on supported browsers | Audio if enabled |
| --- | --- | --- | --- |
| Tap | Raised button depresses; active navigation/filter state | 8 ms | None |
| Submit answer or vote | Existing locked/confirmed state | 18 ms | Submission chime |
| Reveal / completion | Existing reveal, score count and celebration | 20 ms, 50 ms pause, 35 ms | Reveal / winner chime |
| Validation error | Dismissible message | Two 30 ms pulses | Error tone |
| Final timer seconds | Visible countdown | None | Existing tick |

Haptics use the Vibration API as progressive enhancement. Unsupported browsers, including iOS Safari, retain visual and optional audio feedback. Physical haptic feel requires device testing. A native wrapper could add iOS/Android selection, impact, and notification feedback through platform APIs later. No vibration per countdown second, scroll, or keystroke.

System reduced motion and the in-app preference both disable CSS and Motion animations. Sound stays off by default and audio requires interaction. Settings persist in the existing local save; old saves without a haptics property use the enabled default.

## Next product work

1. Validate the new flow with first-time mobile players: find a game, identify a role, submit, understand a reveal, play again.
2. Add actual multi-device rooms before QR/code joining. Keep host authority and reconnect states explicit.
3. For a native build, integrate platform haptics and test on iPhone/Android hardware.
4. Consider avatar unlocks and longer-term quests only after account-backed persistence exists. Avoid fake social activity or punitive streak mechanics for occasional party play.

## Validation

Run `npm run build`, `npm test`, `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`, and `node scripts/experience-qa.cjs`. The experience suite covers 10 routes at four widths, navigation, actual round-driven progress, motion persistence, and opt-out/opt-in vibration behavior using a browser capability stub.
