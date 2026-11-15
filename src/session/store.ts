import { liveAction, liveActive, demoSnapshot } from "./transport";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import {
  advance,
  calculate,
  makePlayers,
  newRound,
  rank,
  roundStreak,
  streakBonus,
  submit,
  type Game,
  type Player,
  type Question,
} from "../engine";
import { useParty } from "../store";
import {
  championship,
  breakdown,
  completion,
  eligible,
  hash,
  roomCode,
  lobbyPlayers,
  poolFor,
  setupIssues,
  starter,
  type DemoState,
  type Night,
  type NightRound,
  type Result,
  type Segment,
} from "./model";
import { normalizeOptions, simulateOne } from "./simulation";

type Setup = {
  name: string;
  count: number;
  itinerary: Segment[];
  vibe: Night["vibe"];
  allowRepeats: boolean;
  seed: number;
};
type State = {
  night: Night | null;
  demo: DemoState;
  needsResume: boolean;
  error: string;
  promptHistory: string[];
  roleHistory: Record<string, number>;
  drafts: Record<string, string>;
  createNight: (setup: Setup) => boolean;
  startNight: () => void;
  joinLobby: (code: string, name: string) => boolean;
  leaveLobby: () => void;
  fillLobby: () => void;
  lockLobby: () => void;
  begin: (practice?: boolean) => void;
  next: () => void;
  send: (value: string) => boolean;
  pause: () => void;
  resume: () => void;
  tick: () => void;
  addTime: () => void;
  skip: () => void;
  fallback: () => void;
  replay: () => void;
  voidResult: () => void;
  rematch: () => void;
  finish: () => void;
  setDemo: (p: Partial<DemoState>) => void;
  draft: (value: string) => void;
  updatePlayer: (id: string, p: Partial<Player>) => void;
  disconnect: (id: string) => void;
  removePlayer: (id: string) => void;
  scenario: (name: string) => void;
  fill: () => void;
  override: (id: string, value: string) => void;
  reset: () => void;
  clearError: () => void;
};
const demoDefaults: DemoState = {
  view: "together",
  preview: "p0",
  controlled: "p0",
  auto: true,
  seed: 42,
  scenario: "First night",
  spoilers: false,
  step: 0,
  holdout: "",
  disconnected: [],
};
const storage: StateStorage = {
  getItem: (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) JSON.parse(raw);
      return raw;
    } catch {
      queueMicrotask(() =>
        useNight.setState({
          error:
            "This browser’s saved night could not be read. You can start a fresh demo; your question library is separate.",
        }),
      );
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      queueMicrotask(() => {
        if (
          useNight.getState().error !==
          "This browser could not save the night. Keep this tab open, or export the results from Demo tools."
        )
          useNight.setState({
            error:
              "This browser could not save the night. Keep this tab open, or export the results from Demo tools.",
          });
      });
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* Keep the in-memory demo usable. */
    }
  },
};
const uid = () => crypto.randomUUID();
const questions = () => useParty.getState().questions;
function timer(n: Night, phase = "writing") {
  return n.vibe === "comfortable"
    ? 86400
    : phase === "voting"
      ? 20
      : n.itinerary[n.segment].game === "bluff"
        ? 35
        : n.itinerary[n.segment].game === "who"
          ? 30
          : 25;
}
function practiceQuestion(game: Game): Question {
  return {
    id: `practice-${game}`,
    game,
    text:
      game === "ballpark"
        ? "How many sides does a triangle have?"
        : game === "bluff"
          ? "Which animal is often called a human’s best friend?"
          : "What is your ideal movie-night snack?",
    answer: game === "ballpark" ? "3" : game === "bluff" ? "A dog" : "",
    pack: "Practice",
    category: "Practice",
    enabled: true,
    tolerance: 3,
    unit: game === "ballpark" ? "sides" : undefined,
    guidance: "Share only what feels comfortable.",
    skip: true,
  };
}
function makeRound(
  n: Night,
  seed: number,
  practice: boolean,
  replay = false,
  oldQuestion?: Question,
): NightRound {
  const segment = n.itinerary[n.segment];
  const available = poolFor(questions(), segment);
  const unused = available.filter((q) => !n.used.includes(q.id));
  const q =
    oldQuestion ||
    (practice
      ? practiceQuestion(segment.game)
      : unused[0] ||
        (n.allowRepeats
          ? available[(n.roundNumber - 1) % available.length]
          : undefined));
  if (!q)
    throw Error(
      "No unused prompts remain. Choose another pack in setup, or explicitly allow repeated prompts.",
    );
  const r = newRound(segment.game, n.roundNumber, n.players, [q], timer(n), {
    base: useParty.getState().settings.base,
    speed: n.vibe === "competitive" ? useParty.getState().settings.speed : 0,
  });
  const ids = [...r.participants].sort(
    (a, b) =>
      (n.roleCounts[a] || 0) - (n.roleCounts[b] || 0) ||
      hash(seed, a) - hash(seed, b),
  );
  return {
    ...r,
    id: uid(),
    question: { ...q },
    author: ids[0],
    bluffers: ids.slice(0, 3),
    practice,
    replay,
    revealElapsed: 0,
    revealReady: false,
    fallbacks: [],
    seed,
    phase: "countdown",
    remaining: 3,
  };
}
function awarded(n: Night, r: NightRound): Night {
  if (r.awarded) return { ...n, round: r };
  const frozen = {
    ...r,
    points: calculate(r, n.players),
    bonuses: Object.fromEntries(
      n.players
        .filter((p) => r.participants.includes(p.id))
        .map((p) => [p.id, streakBonus(r, p)]),
    ),
    streaks: Object.fromEntries(
      n.players
        .filter((p) => r.participants.includes(p.id))
        .map((p) => [p.id, roundStreak(r, p)]),
    ),
  };
  // Curated system fallbacks never earn a human deception reward.
  frozen.fallbacks.forEach((id) => {
    frozen.points[id] = 0;
  });
  if (r.practice || r.replay)
    return { ...n, round: { ...frozen, awarded: true } };
  if (n.ledger.some((l) => l.id === r.id))
    return { ...n, round: { ...frozen, awarded: true } };
  const before = n.players;
  const positions = rank(before);
  const players = before.map((p) => {
    if (!r.participants.includes(p.id)) return p;
    const next = {
      ...p,
      previousScore: p.score,
      previous: positions.find((x) => x.id === p.id)!.rank,
      streak: frozen.streaks[p.id],
      games: {
        ...p.games,
        [r.game]: p.games[r.game] + (frozen.points[p.id] || 0),
      },
      played: { ...p.played, [r.game]: p.played[r.game] + 1 },
    };
    return { ...next, score: championship(next) };
  });
  const values = Object.values(frozen.points),
    best = Math.max(...values);
  const result: Result = {
    id: r.id,
    sessionId: n.id,
    segmentId: n.itinerary[n.segment].id,
    round: r.number,
    game: r.game,
    rulesVersion: "baseline-1",
    attempt: { ...frozen, awarded: true },
    players: before.map((p) => ({
      ...p,
      games: { ...p.games },
      played: { ...p.played },
    })),
    breakdown: Object.fromEntries(
      before.map((p) => [
        p.id,
        breakdown(
          frozen,
          p,
          players.find((x) => x.id === p.id)!,
        ),
      ]),
    ),
    winners:
      best > 0
        ? Object.keys(frozen.points).filter((id) => frozen.points[id] === best)
        : [],
    voided: false,
  };
  const roleCounts = { ...n.roleCounts };
  (r.game === "bluff"
    ? r.bluffers
    : r.game === "who"
      ? [r.author]
      : []
  ).forEach((id) => {
    roleCounts[id] = (roleCounts[id] || 0) + 1;
  });
  return {
    ...n,
    players,
    round: { ...frozen, awarded: true },
    ledger: [...n.ledger, result],
    roleCounts,
  };
}
export const useNight = create<State>()(
  persist(
    (set, get) => ({
      night: null,
      demo: demoDefaults,
      needsResume: false,
      error: "",
      promptHistory: [],
      roleHistory: {},
      drafts: {},
      createNight: (setup) => {
        const issues = setupIssues(
          questions(),
          setup.itinerary,
          setup.count,
          setup.allowRepeats,
        );
        if (issues.length) {
          set({ error: issues[0] });
          return false;
        }
        const previous = get().night;
        const players = makePlayers(setup.count).map((p, i) => ({
          ...p,
          name: previous?.players[i]?.name || p.name,
          avatar: previous?.players[i]?.avatar || String(i),
        }));
        set({
          night: {
            id: uid(),
            name: setup.name.trim() || "Our game night",
            status: "lobby",
            itinerary: setup.itinerary.map((s, i) => ({
              ...s,
              id: `${i}-${uid()}`,
            })),
            segment: 0,
            roundNumber: 1,
            players,
            round: null,
            ledger: [],
            used: [],
            stamps: [],
            vibe: setup.vibe,
            allowRepeats: setup.allowRepeats,
            roleCounts: get().roleHistory,
            paused: false,
            lobby: { joined: [players[0].id], locked: false, elapsed: 0 },
          },
          demo: { ...demoDefaults, seed: setup.seed },
          needsResume: false,
          error: "",
          drafts: {},
        });
        return true;
      },
      startNight: () => {
        if (liveAction("startNight")) return;
        const n = get().night;
        if (!n || n.status !== "lobby") return;
        const players = lobbyPlayers(n);
        const issues = setupIssues(
          questions(),
          n.itinerary,
          players.length,
          n.allowRepeats,
          n.used,
        );
        if (issues.length) return set({ error: issues[0] });
        set({
          night: { ...n, players, status: "intro", paused: false },
          demo: {
            ...get().demo,
            controlled: players.some((p) => p.id === get().demo.controlled)
              ? get().demo.controlled
              : players[0].id,
            preview: players.some((p) => p.id === get().demo.preview)
              ? get().demo.preview
              : players[0].id,
          },
          needsResume: false,
          error: "",
        });
      },
      joinLobby: (code, name) => {
        const { night: n, demo } = get();
        if (!n || n.status !== "lobby") return false;
        if (n.lobby?.locked) {
          set({ error: "The room is locked. Unlock it to join." });
          return false;
        }
        if (code.replace(/\s/g, "") !== roomCode(n)) {
          set({
            error:
              "That code doesn’t match. Enter the six digits on the shared screen.",
          });
          return false;
        }
        if (!name.trim()) {
          set({ error: "Enter a name so the room knows who joined." });
          return false;
        }
        const joined = n.lobby?.joined || n.players.map((p) => p.id);
        set({
          night: {
            ...n,
            players: n.players.map((p) =>
              p.id === demo.controlled
                ? { ...p, name: name.trim().slice(0, 32) }
                : p,
            ),
            lobby: {
              joined: [...new Set([...joined, demo.controlled])],
              locked: false,
              elapsed: n.lobby?.elapsed || 0,
            },
          },
          error: "",
        });
        return true;
      },
      leaveLobby: () => {
        if (liveAction("leaveLobby")) return;
        const { night: n, demo } = get();
        if (!n || n.status !== "lobby") return;
        set({
          night: {
            ...n,
            lobby: {
              joined: (n.lobby?.joined || n.players.map((p) => p.id)).filter(
                (id) => id !== demo.controlled,
              ),
              locked: n.lobby?.locked || false,
              elapsed: n.lobby?.elapsed || 0,
            },
          },
          error: "",
        });
      },
      fillLobby: () => {
        if (liveAction("fillLobby")) return;
        const n = get().night;
        if (!n || n.status !== "lobby" || n.lobby?.locked) return;
        set({
          night: {
            ...n,
            lobby: {
              joined: n.players.filter((p) => p.connected).map((p) => p.id),
              locked: false,
              elapsed: n.lobby?.elapsed || 0,
            },
          },
        });
      },
      lockLobby: () => {
        if (liveAction("lockLobby")) return;
        const n = get().night;
        if (!n || n.status !== "lobby") return;
        set({
          night: {
            ...n,
            lobby: {
              joined: n.lobby?.joined || n.players.map((p) => p.id),
              locked: !n.lobby?.locked,
              elapsed: n.lobby?.elapsed || 0,
            },
          },
        });
      },
      begin: (practice = false) => {
        if (liveAction("begin", practice)) return;
        const n = get().night;
        if (!n) return;
        try {
          const r = makeRound(
            n,
            get().demo.seed + n.segment * 19 + n.roundNumber,
            practice,
          );
          set({
            night: {
              ...n,
              status: "playing",
              round: r,
              paused: false,
              used: practice ? n.used : [...n.used, r.question.id],
            },
            demo: { ...get().demo, step: 0 },
            error: "",
            drafts: {},
          });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },
      next: () => {
        if (liveAction("next")) return;
        const { night: n } = get();
        if (!n || n.paused || get().needsResume) return;
        if (n.status === "lobby") return get().startNight();
        if (n.status === "intro" || n.status === "transition")
          return get().begin(true);
        const r = n.round;
        if (!r) return;
        try {
          if (r.phase === "reveal") {
            if (!r.revealReady)
              return set({
                night: {
                  ...n,
                  round: { ...r, revealReady: true, revealElapsed: 32 },
                },
              });
            return set({
              night: { ...n, round: { ...r, phase: "standings" } },
            });
          }
          if (r.phase === "standings") {
            if (r.practice) return get().begin(false);
            if (r.replay) {
              const original = n.ledger.find(
                (l) =>
                  !l.voided &&
                  l.segmentId === n.itinerary[n.segment].id &&
                  l.round === n.roundNumber,
              );
              if (original) {
                set({
                  night: {
                    ...n,
                    round: {
                      ...original.attempt,
                      phase: "standings",
                      revealReady: true,
                    },
                  },
                });
                return;
              }
            }
            if (n.roundNumber < n.itinerary[n.segment].rounds) {
              set({ night: { ...n, roundNumber: n.roundNumber + 1 } });
              get().begin(false);
              return;
            }
            const stamps = [
              ...new Set([...n.stamps, n.itinerary[n.segment].id]),
            ];
            if (n.segment < n.itinerary.length - 1)
              set({
                night: {
                  ...n,
                  stamps,
                  status: "transition",
                  segment: n.segment + 1,
                  roundNumber: 1,
                  round: null,
                },
              });
            else
              set({
                night: { ...n, stamps, status: "finale", round: null },
                roleHistory: n.roleCounts,
                promptHistory: [
                  ...new Set([...get().promptHistory, ...n.used]),
                ],
              });
            return;
          }
          const progress = completion(r);
          if (
            r.phase === "writing" &&
            r.game === "ballpark" &&
            !progress.received
          )
            throw Error(
              "At least one estimate is needed. Add time or choose another prompt.",
            );
          let source = r;
          if (r.game === "who" && r.phase === "writing") {
            const answered = r.participants.filter((id) => r.answers[id]);
            if (!answered.length) throw Error("At least one answer is needed.");
            const leastUsed = Math.min(
              ...answered.map((id) => n.roleCounts[id] || 0),
            );
            const pool = answered.filter(
              (id) => (n.roleCounts[id] || 0) === leastUsed,
            );
            source = { ...r, author: pool[hash(r.seed, r.id) % pool.length] };
          }
          let next = {
            ...advance(
              source,
              n.players,
              timer(n, r.phase === "writing" ? "voting" : "writing"),
            ),
          } as NightRound;
          if (next.phase === "voting")
            next = { ...normalizeOptions(next, r.seed) } as NightRound;
          if (next.phase === "reveal") {
            const updated = awarded(n, next);
            set({
              night: updated,
              demo: { ...get().demo, step: 0 },
              error: "",
            });
          } else
            set({
              night: { ...n, round: next },
              demo: { ...get().demo, step: 0 },
              error: "",
            });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },
      send: (value) => {
        if (liveActive()) return liveAction("send", value);
        const { night: n, demo } = get();
        if (!n?.round) return false;
        if (n.paused || get().needsResume) {
          set({ error: "Paused by host. Your draft is kept here." });
          return false;
        }
        try {
          const r = n.round;
          const p = n.players.find((p) => p.id === demo.controlled)!;
          const choice =
            r.phase === "voting" && r.game === "bluff"
              ? r.options[Number(value.replace("choice-", ""))]?.id || ""
              : value;
          const next = submit(
            r,
            { ...p, connected: !demo.disconnected.includes(p.id) },
            choice,
            Math.max(0, r.duration - r.remaining),
          );
          set({ night: { ...n, round: { ...r, ...next } }, error: "" });
          return true;
        } catch (e) {
          set({ error: (e as Error).message });
          return false;
        }
      },
      pause: () => {
        if (liveAction("pause")) return;
        const n = get().night;
        if (n)
          set({
            night: {
              ...n,
              paused: !n.paused,
              round: n.round ? { ...n.round, paused: !n.paused } : null,
            },
          });
      },
      resume: () => {
        if (liveAction("resume")) return;
        const n = get().night;
        if (n)
          set({
            needsResume: false,
            night: {
              ...n,
              paused: false,
              round: n.round ? { ...n.round, paused: false } : null,
            },
            error: "",
          });
      },
      tick: () => {
        if (liveAction("tick")) return;
        const { night: n, demo } = get();
        if (
          n?.status === "lobby" &&
          n.lobby &&
          !n.lobby.locked &&
          demo.auto &&
          !get().needsResume
        ) {
          const elapsed = n.lobby.elapsed + 1;
          const waiting = n.players.find(
            (p) =>
              p.connected &&
              p.id !== demo.controlled &&
              !n.lobby!.joined.includes(p.id),
          );
          if (!waiting) return;
          set({
            night: {
              ...n,
              lobby: {
                ...n.lobby,
                elapsed,
                joined:
                  elapsed % 4 === 0
                    ? [...n.lobby.joined, waiting.id]
                    : n.lobby.joined,
              },
            },
          });
          return;
        }
        if (
          !n?.round ||
          n.paused ||
          get().needsResume ||
          n.status !== "playing"
        )
          return;
        let r = n.round;
        // Holding a finished reveal must not keep rewriting the saved ledger.
        if (r.phase === "reveal" && r.revealReady) return;
        if (
          n.vibe === "comfortable" &&
          ["writing", "voting"].includes(r.phase)
        ) {
          const progress = completion(r);
          if (progress.received === progress.required) return;
        }
        const step = demo.step + 1;
        if (r.phase === "reveal") {
          const elapsed = r.revealElapsed + 1;
          set({
            night: {
              ...n,
              round: {
                ...r,
                revealElapsed: elapsed,
                revealReady: r.revealReady || elapsed >= 20,
              },
            },
            demo: { ...demo, step },
          });
          return;
        }
        if (!["countdown", "writing", "voting"].includes(r.phase)) return;
        if (demo.auto && r.phase !== "countdown" && r.remaining > 0) {
          const entries = r.phase === "writing" ? r.answers : r.votes;
          for (const id of eligible(r)) {
            if (
              id === demo.controlled ||
              id === demo.holdout ||
              demo.disconnected.includes(id) ||
              entries[id]
            )
              continue;
            if (step >= 5 + (hash(r.seed, `${id}-${r.phase}`) % 32))
              r = simulateOne(
                r,
                n.players.find((p) => p.id === id)!,
              );
          }
        }
        if (
          step % 4 === 0 &&
          (n.vibe !== "comfortable" || r.phase === "countdown")
        )
          r = { ...r, remaining: Math.max(0, r.remaining - 1) };
        set({ night: { ...n, round: r }, demo: { ...demo, step } });
        if (r.phase === "countdown" && r.remaining === 0) get().next();
      },
      addTime: () => {
        if (liveAction("addTime")) return;
        const n = get().night;
        if (n?.round && ["writing", "voting"].includes(n.round.phase))
          set({
            night: {
              ...n,
              round: {
                ...n.round,
                remaining: Math.min(120, n.round.remaining + 10),
                duration: n.round.duration + 10,
              },
            },
            error: "",
          });
      },
      skip: () => {
        if (liveAction("skip")) return;
        const n = get().night;
        if (!n?.round) return;
        if (n.round.awarded && !n.round.practice && !n.round.replay)
          return set({
            error:
              "This result is already recorded. Use an unscored replay, or void and replace it in Demo tools.",
          });
        try {
          const r = makeRound(
            n,
            get().demo.seed + get().demo.step + 1,
            n.round.practice,
            n.round.replay,
            n.round.practice
              ? poolFor(questions(), n.itinerary[n.segment]).find(
                  (q) => q.id !== n.round!.question.id,
                )
              : undefined,
          );
          set({
            night: {
              ...n,
              round: {
                ...r,
                author: r.participants.includes(n.round.author)
                  ? n.round.author
                  : r.author,
                bluffers: n.round.bluffers.every((id) =>
                  r.participants.includes(id),
                )
                  ? n.round.bluffers
                  : r.bluffers,
                phase: "writing",
                remaining: timer(n),
              },
              paused: false,
              used: n.round.practice ? n.used : [...n.used, r.question.id],
            },
            demo: { ...get().demo, step: 0 },
            drafts: {},
            error: "",
          });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },
      fallback: () => {
        if (liveAction("fallback")) return;
        const n = get().night;
        if (!n?.round || n.round.phase !== "writing") return;
        let r = {
          ...n.round,
          remaining: Math.max(10, n.round.remaining),
          paused: false,
        };
        completion(r).missing.forEach((id) => {
          const next = simulateOne(
            r,
            n.players.find((p) => p.id === id)!,
          );
          if (next.answers[id])
            r = { ...next, fallbacks: [...next.fallbacks, id] };
        });
        set({ night: { ...n, round: r }, error: "" });
      },
      replay: () => {
        if (liveAction("replay")) return;
        const n = get().night;
        if (!n?.round || !n.round.awarded) return;
        const r = makeRound(n, n.round.seed, false, true, n.round.question);
        // Replaying an attempt preserves its roles as well as its prompt.
        set({
          night: {
            ...n,
            status: "playing",
            paused: false,
            round: { ...r, author: n.round.author, bluffers: n.round.bluffers },
          },
          demo: { ...get().demo, step: 0 },
          error: "",
          drafts: {},
        });
      },
      voidResult: () => {
        if (liveAction("voidResult")) return;
        const n = get().night;
        if (!n?.round) return;
        const result = n.ledger.find((l) => l.id === n.round!.id && !l.voided);
        if (!result) return;
        const roleCounts = { ...n.roleCounts };
        (result.game === "bluff"
          ? result.attempt.bluffers
          : result.game === "who"
            ? [result.attempt.author]
            : []
        ).forEach(
          (id) => (roleCounts[id] = Math.max(0, (roleCounts[id] || 0) - 1)),
        );
        const restored = {
          ...n,
          players: result.players,
          roleCounts,
          ledger: n.ledger.map((l) =>
            l.id === result.id ? { ...l, voided: true } : l,
          ),
        };
        const r = makeRound(
          restored,
          result.attempt.seed,
          false,
          false,
          result.attempt.question,
        );
        set({
          night: {
            ...restored,
            round: {
              ...r,
              author: result.attempt.author,
              bluffers: result.attempt.bluffers,
            },
            paused: false,
          },
          demo: { ...get().demo, step: 0 },
          error: "",
          drafts: {},
        });
      },
      rematch: () => {
        if (liveAction("rematch")) return;
        const n = get().night;
        if (!n) return;
        const players = n.players.map((p) => ({
          ...p,
          score: 0,
          previousScore: 0,
          streak: 0,
          games: { bluff: 0, who: 0, ballpark: 0 },
          played: { bluff: 0, who: 0, ballpark: 0 },
        }));
        const issues = setupIssues(
          questions(),
          n.itinerary,
          players.filter((p) => p.connected).length,
          n.allowRepeats,
          n.used,
        );
        if (issues.length) {
          set({ error: `For a rematch: ${issues[0]}` });
          return;
        }
        set({
          night: {
            ...n,
            id: uid(),
            status: "lobby",
            segment: 0,
            roundNumber: 1,
            round: null,
            players,
            ledger: [],
            stamps: [],
            paused: false,
            lobby: {
              joined: players.filter((p) => p.connected).map((p) => p.id),
              locked: false,
              elapsed: 0,
            },
          },
          demo: { ...get().demo, step: 0, spoilers: false },
          needsResume: false,
          error: "",
          drafts: {},
        });
      },
      finish: () => {
        if (liveAction("finish")) return;
        const n = get().night;
        if (n)
          set({
            night: { ...n, status: "finale", paused: false, round: null },
            roleHistory: n.roleCounts,
            promptHistory: [...new Set([...get().promptHistory, ...n.used])],
          });
      },
      setDemo: (p) => set({ demo: { ...get().demo, ...p } }),
      draft: (value) => {
        const r = get().night?.round;
        if (r)
          set({
            drafts: {
              ...get().drafts,
              [`${r.id}-${get().demo.controlled}`]: value,
            },
          });
      },
      updatePlayer: (id, p) => {
        if (liveAction("updatePlayer", id, p)) return;
        const n = get().night;
        if (n)
          set({
            night: {
              ...n,
              players: n.players.map((x) => (x.id === id ? { ...x, ...p } : x)),
            },
          });
      },
      disconnect: (id) => {
        const d = get().demo;
        set({
          demo: {
            ...d,
            disconnected: d.disconnected.includes(id)
              ? d.disconnected.filter((x) => x !== id)
              : [...d.disconnected, id],
          },
        });
      },
      removePlayer: (id) => {
        if (liveAction("removePlayer", id)) return;
        const n = get().night;
        if (!n) return;
        if (n.status === "lobby")
          set({
            night: { ...n, players: n.players.filter((p) => p.id !== id) },
          });
        else
          set({
            night: {
              ...n,
              players: n.players.map((p) =>
                p.id === id ? { ...p, connected: false } : p,
              ),
            },
            error:
              "Removal scheduled for the next round. This round and its accepted answers are preserved.",
          });
      },
      scenario: (name) => {
        const config: Setup = {
          name: "The Friday Night Club",
          count: name === "Big party" ? 24 : 8,
          itinerary: starter(name === "First night" ? 3 : 1),
          vibe: name === "Comfortable mode" ? "comfortable" : "easygoing",
          allowRepeats: false,
          seed: get().demo.seed,
        };
        get().createNight(config);
        get().fillLobby();
        set({ demo: { ...get().demo, scenario: name }, error: "" });
        if (
          name === "First night" ||
          name === "Quick tour" ||
          name === "Big party" ||
          name === "Comfortable mode"
        )
          return;
        const game: Game =
          name === "Write a bluff"
            ? "bluff"
            : name === "Be the secret author"
              ? "who"
              : "ballpark";
        const n = get().night!;
        set({
          night: {
            ...n,
            itinerary: [{ id: uid(), game, rounds: 1, pack: "all" }],
            status: "intro",
          },
        });
        get().begin(false);
        const current = get().night!;
        let r = {
          ...current.round!,
          phase: "writing" as const,
          remaining: timer(current),
        };
        if (game === "who") r = { ...r, author: "p0" };
        if (game === "bluff") r = { ...r, bluffers: ["p0", "p1", "p2"] };
        let players = current.players;
        if (name === "Close finish")
          players = players.map((p, i) => ({
            ...p,
            score: 900 + i * 3,
            games: { ...p.games, bluff: 450 + i },
            played: { ...p.played, bluff: 1 },
          }));
        set({
          night: { ...current, players, round: r },
          demo: {
            ...get().demo,
            holdout: name === "Waiting on one player" ? "p7" : "",
          },
        });
        if (name === "Player returns") {
          get().send("88");
          set({
            needsResume: true,
            night: {
              ...get().night!,
              paused: true,
              round: { ...get().night!.round!, paused: true },
            },
          });
        }
        if (name === "Waiting on one player") {
          get().send(
            String(
              Number(r.question.answer) + (r.question.tolerance || 1) * 0.2,
            ),
          );
          get().fill();
        }
      },
      fill: () => {
        if (liveAction("fill")) return;
        const { night: n, demo } = get();
        if (!n?.round || n.paused) return;
        let r = n.round;
        eligible(r)
          .filter(
            (id) =>
              id !== demo.controlled &&
              id !== demo.holdout &&
              !demo.disconnected.includes(id),
          )
          .forEach((id) => {
            if (!(r.phase === "writing" ? r.answers : r.votes)[id])
              r = simulateOne(
                r,
                n.players.find((p) => p.id === id)!,
              );
          });
        set({ night: { ...n, round: r } });
      },
      override: (id, value) => {
        const n = get().night;
        if (!n?.round) return;
        const r = n.round;
        const key = r.phase === "voting" ? "votes" : "answers";
        const entries = { ...r[key] };
        delete entries[id];
        try {
          const next = submit(
            { ...r, [key]: entries },
            n.players.find((p) => p.id === id)!,
            value,
            5,
          );
          set({ night: { ...n, round: { ...r, ...next } }, error: "" });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },
      reset: () =>
        set({
          night: null,
          demo: demoDefaults,
          needsResume: false,
          error: "",
          drafts: {},
          promptHistory: [],
          roleHistory: {},
        }),
      clearError: () => set({ error: "" }),
    }),
    {
      name: "afterparty-night",
      version: 2,
      storage: createJSONStorage(() => storage),
      partialize: ({ night, demo, promptHistory, roleHistory, drafts }) =>
        demoSnapshot() || {
          night,
          demo,
          promptHistory,
          roleHistory,
          drafts,
        },
      migrate: () => ({
        night: null,
        demo: demoDefaults,
        promptHistory: [],
        roleHistory: {},
        drafts: {},
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.night && state.night.status === "playing") {
          state.needsResume = true;
          state.night = {
            ...state.night,
            paused: true,
            round: state.night.round
              ? { ...state.night.round, paused: true }
              : null,
          };
        }
      },
    },
  ),
);
