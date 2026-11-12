import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  advance,
  defaults,
  makePlayers,
  newRound,
  rank,
  submit,
  type Game,
  type Player,
  type Question,
  type Round,
} from "./engine";
import { simulate } from "./simulation";
export type Settings = {
  timer: number;
  rounds: number;
  sound: boolean;
  reduced: boolean;
  haptics: boolean;
  party: string;
  pack?: string;
  base: number;
  speed: number;
};
interface State {
  players: Player[];
  questions: Question[];
  round: Round | null;
  active: string;
  settings: Settings;
  history: { game: Game; round: number; winner: string }[];
  error: string;
  init: (n?: number) => void;
  start: (g: Game) => void;
  next: () => void;
  sim: () => void;
  send: (v: string) => void;
  setActive: (id: string) => void;
  setAuthor: (id: string) => void;
  editSubmission: (id: string, v: string, seconds?: number) => void;
  tick: () => void;
  pause: () => void;
  restart: (game?: boolean) => void;
  finish: () => void;
  reset: () => void;
  updatePlayer: (id: string, p: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  saveQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  replaceQuestions: (q: Question[]) => void;
  configure: (s: Partial<Settings>) => void;
  skipQuestion: () => void;
  clearError: () => void;
  resetDefaults: () => void;
}
const config: Settings = {
  timer: 30,
  rounds: 3,
  sound: false,
  reduced: false,
  haptics: true,
  party: "The Friday Night Club",
  base: 300,
  speed: 200,
};
export const useParty = create<State>()(
  persist(
    (set, get) => ({
      players: makePlayers(),
      questions: defaults,
      round: null,
      active: "p0",
      settings: config,
      history: [],
      error: "",
      init: (n = 14) =>
        set({
          players: makePlayers(n),
          round: null,
          active: "p0",
          history: [],
        }),
      start: (g) => {
        try {
          if (
            get().settings.pack &&
            get().settings.pack !== "all" &&
            !get().questions.some(
              (q) => q.game === g && q.pack === get().settings.pack,
            )
          )
            get().configure({ pack: "all" });
          set({
            round: newRound(
              g,
              1,
              get().players,
              get().questions.filter(
                (q) =>
                  !get().settings.pack ||
                  get().settings.pack === "all" ||
                  q.pack === get().settings.pack,
              ),
              get().settings.timer,
              { base: get().settings.base, speed: get().settings.speed },
            ),
            error: "",
          });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },
      next: () => {
        const s = get(),
          r = s.round;
        if (!r) return;
        try {
          if (r.phase === "standings") {
            set({
              round:
                r.number >= s.settings.rounds
                  ? { ...r, phase: "complete" }
                  : newRound(
                      r.game,
                      r.number + 1,
                      s.players,
                      s.questions.filter(
                        (q) =>
                          !s.settings.pack ||
                          s.settings.pack === "all" ||
                          q.pack === s.settings.pack,
                      ),
                      s.settings.timer,
                      { base: s.settings.base, speed: s.settings.speed },
                    ),
            });
            return;
          }
          let next = advance(r, s.players, s.settings.timer);
          if (next.phase === "standings" && !r.awarded) {
            const positions = rank(s.players);
            const players = s.players.map((p) => {
              const raw = r.points[p.id] || 0;
              const earned = Object.keys(r.points).includes(p.id);
              const played = {
                ...p.played,
                [r.game]: p.played[r.game] + (earned ? 1 : 0),
              };
              const gameScores = {
                ...p.games,
                [r.game]: p.games[r.game] + raw,
              };
              const score = Math.round(
                (["bluff", "who", "ballpark"] as Game[]).reduce(
                  (sum, g) =>
                    sum +
                    (played[g]
                      ? Math.min(
                          1000,
                          (gameScores[g] /
                            played[g] /
                            (g === "bluff" ? 500 : g === "who" ? 500 : 1000)) *
                            1000,
                        )
                      : 0),
                  0,
                ),
              );
              return {
                ...p,
                previous: positions.find((x) => x.id === p.id)?.rank || 1,
                games: gameScores,
                played,
                score,
              };
            });
            next = { ...next, awarded: true };
            set({
              players,
              history: [
                ...s.history,
                {
                  game: r.game,
                  round: r.number,
                  winner: rank(players)[0]?.name || "",
                },
              ],
            });
          }
          set({ round: next, error: "" });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },
      sim: () => {
        const s = get();
        if (s.round)
          set({
            round: simulate(s.round, s.players, s.settings.timer),
            error: "",
          });
      },
      send: (v) => {
        const s = get();
        if (!s.round) return;
        try {
          if (
            s.round.phase === "voting" &&
            s.round.game === "who" &&
            !s.players.some((p) => p.id === v)
          )
            throw Error("Choose another party member.");
          set({
            round: submit(
              s.round,
              s.players.find((p) => p.id === s.active)!,
              v,
              s.round.duration - s.round.remaining,
            ),
            error: "",
          });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },
      setActive: (active) => set({ active }),
      setAuthor: (id) => {
        const r = get().round;
        if (r && r.phase === "writing" && r.game === "who")
          set({ round: { ...r, author: id, answers: {} } });
      },
      editSubmission: (id, v, seconds = 8) => {
        const r = get().round;
        if (!r || !["writing", "voting"].includes(r.phase)) return;
        const p = get().players.find((p) => p.id === id);
        if (!p) return;
        try {
          const key = r.phase === "writing" ? "answers" : "votes";
          const cleaned = { ...r, [key]: { ...r[key] } };
          delete cleaned[key][id];
          set({ round: submit(cleaned, p, v, seconds), error: "" });
        } catch (e) {
          set({ error: (e as Error).message });
        }
      },
      tick: () => {
        const r = get().round;
        if (
          r &&
          !r.paused &&
          ["countdown", "writing", "voting"].includes(r.phase) &&
          r.remaining > 0
        ) {
          set({ round: { ...r, remaining: r.remaining - 1 } });
          if (r.remaining === 1 && r.phase === "countdown") get().next();
        }
      },
      pause: () => {
        const r = get().round;
        if (r) set({ round: { ...r, paused: !r.paused } });
      },
      restart: (game = false) => {
        const s = get(),
          r = s.round;
        if (r)
          set({
            round: newRound(
              r.game,
              game ? 1 : r.number,
              s.players,
              s.questions.filter(
                (q) =>
                  !s.settings.pack ||
                  s.settings.pack === "all" ||
                  q.pack === s.settings.pack,
              ),
              s.settings.timer,
              { base: s.settings.base, speed: s.settings.speed },
            ),
          });
      },
      finish: () => {
        let r = get().round;
        if (!r) return;
        for (
          let i = 0;
          i < 8 && r.phase !== "standings" && r.phase !== "complete";
          i++
        ) {
          get().sim();
          get().next();
          r = get().round!;
        }
        set({ round: { ...get().round!, phase: "complete" } });
      },
      reset: () =>
        set({
          players: makePlayers(get().players.length),
          round: null,
          history: [],
          error: "",
        }),
      updatePlayer: (id, p) =>
        set({
          players: get().players.map((x) => (x.id === id ? { ...x, ...p } : x)),
        }),
      removePlayer: (id) => {
        const players = get().players.filter((p) => p.id !== id);
        set({
          players,
          round: null,
          active: get().active === id ? players[0]?.id || "" : get().active,
        });
      },
      saveQuestion: (q) =>
        set({
          questions: get().questions.some((x) => x.id === q.id)
            ? get().questions.map((x) => (x.id === q.id ? q : x))
            : [...get().questions, q],
        }),
      deleteQuestion: (id) =>
        set({ questions: get().questions.filter((q) => q.id !== id) }),
      replaceQuestions: (questions) => set({ questions }),
      configure: (s) => set({ settings: { ...get().settings, ...s } }),
      skipQuestion: () => {
        const s = get(),
          r = s.round;
        if (!r || ["standings", "complete"].includes(r.phase)) return;
        const pool = s.questions.filter(
          (q) =>
            q.game === r.game &&
            q.enabled &&
            (!s.settings.pack ||
              s.settings.pack === "all" ||
              q.pack === s.settings.pack),
        );
        const q =
          pool[
            (pool.findIndex((q) => q.id === r.question.id) + 1) % pool.length
          ];
        if (q)
          set({
            round: {
              ...r,
              question: q,
              phase: "writing",
              answers: {},
              votes: {},
              options: [],
              points: {},
              remaining: s.settings.timer,
            },
          });
      },
      clearError: () => set({ error: "" }),
      resetDefaults: () => set({ questions: defaults, settings: config }),
    }),
    {
      name: "afterparty-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        players,
        questions,
        round,
        active,
        settings,
        history,
      }) => ({ players, questions, round, active, settings, history }),
    },
  ),
);
