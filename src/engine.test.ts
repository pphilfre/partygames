import { describe, it, expect, beforeEach } from "vitest";
import {
  advance,
  ballparkScore,
  calculate,
  defaults,
  makePlayers,
  newRound,
  rank,
  speedBonus,
  submit,
  validateQuestion,
} from "./engine";
import { simulate } from "./simulation";
import { useParty } from "./store";
const players = makePlayers(14);
function writing(game: "bluff" | "who" | "ballpark", number = 1) {
  let r = newRound(game, number, players, defaults, 30);
  r = advance(r, players, 30);
  return advance(r, players, 30);
}
describe("game engine", () => {
  it("rotates 3 bluffers fairly through all 14 people", () => {
    const roles = Array.from(
      { length: 14 },
      (_, i) => newRound("bluff", i + 1, players, defaults, 30).bluffers,
    ).flat();
    players.forEach((p) =>
      expect(roles.filter((id) => id === p.id)).toHaveLength(3),
    );
  });
  it("rejects closed, empty, disconnected and ineligible submissions", () => {
    let r = writing("bluff");
    expect(() => submit(r, players[4], "hello", 5)).toThrow();
    expect(() => submit(r, players[0], "", 5)).toThrow();
    expect(() =>
      submit(r, { ...players[0], connected: false }, "lie", 4),
    ).toThrow();
    r = { ...r, phase: "reveal" };
    expect(() => submit(r, players[0], "lie", 5)).toThrow();
  });
  it("attributes every fooled vote to its actual bluff author", () => {
    let r = simulate(writing("bluff"), players, 30);
    r = advance(r, players, 30);
    expect(r.options).toHaveLength(4);
    r = submit(r, players[3], "p0", 4);
    r = submit(r, players[4], "truth", 5);
    expect(() => submit(r, players[0], "truth", 3)).toThrow();
    expect(() => submit(r, players[3], "truth", 5)).toThrow();
    const pts = calculate(r, players);
    expect(pts.p0).toBe(250);
    expect(pts.p4).toBe(500);
  });
  it("keeps the secret author from guessing and applies time bands", () => {
    let r = simulate(writing("who"), players, 30);
    r = advance(r, players, 30);
    expect(() => submit(r, players[0], "p0", 3)).toThrow();
    r = submit(r, players[1], "p0", 4);
    r = submit(r, players[2], "p0", 15);
    expect(calculate(r, players).p1).toBe(500);
    expect(calculate(r, players).p2).toBe(375);
    expect([0, 5, 6, 10, 11, 20, 21].map(speedBonus)).toEqual([
      200, 200, 150, 150, 75, 75, 0,
    ]);
  });
  it("handles zero, negatives, years, outliers and tied closest guesses", () => {
    expect(ballparkScore(0, 0, 1)).toBe(900);
    expect(ballparkScore(-270, -273, 10)).toBe(630);
    expect(ballparkScore(2008, 2007, 20)).toBe(855);
    expect(ballparkScore(1e9, 88, 44)).toBe(0);
    let r = writing("ballpark");
    r = submit(r, players[0], "88", 2);
    r = submit(r, players[1], "88", 3);
    expect(calculate(r, players).p0).toBe(1000);
    expect(calculate(r, players).p1).toBe(1000);
  });
  it("ranks ties with competition positions", () => {
    const p = makePlayers(3);
    p[0].score = 100;
    p[1].score = 100;
    expect(rank(p).map((p) => p.rank)).toEqual([1, 1, 3]);
  });
  it("validates the full starter pack and rejects invalid numerical questions", () => {
    defaults.forEach((q) => expect(validateQuestion(q)).toBe(""));
    expect(
      validateQuestion({
        ...defaults.find((q) => q.game === "ballpark")!,
        answer: "NaN",
      }),
    ).not.toBe("");
    expect(validateQuestion({ ...defaults[0], text: "" })).not.toBe("");
  });
  it.each(["bluff", "who", "ballpark"] as const)(
    "runs deterministic complete %s rounds with 14 players",
    (game) => {
      let r = writing(game);
      expect(simulate(r, players, 30)).toEqual(simulate(r, players, 30));
      r = simulate(r, players, 30);
      expect(Object.keys(r.answers)).toHaveLength(
        game === "bluff" ? 3 : game === "who" ? 1 : 14,
      );
      r = advance(r, players, 30);
      if (r.phase === "voting") {
        r = simulate(r, players, 30);
        expect(Object.keys(r.votes)).toHaveLength(game === "bluff" ? 11 : 13);
        r = advance(r, players, 30);
      }
      expect(r.phase).toBe("reveal");
      expect(Object.values(r.points).some((p) => p > 0)).toBe(true);
      r = advance(r, players, 30);
      expect(r.phase).toBe("standings");
    },
  );
});
describe("store orchestration", () => {
  beforeEach(() => useParty.getState().init(14));
  it("awards once, accumulates across games, and finishes the configured game", () => {
    const s = () => useParty.getState();
    s().configure({ rounds: 1 });
    for (const game of ["bluff", "who", "ballpark"] as const) {
      s().start(game);
      s().next();
      s().next();
      s().sim();
      s().next();
      if (s().round?.phase === "voting") {
        s().sim();
        s().next();
      }
      s().next();
      const before = s().players.map((p) => p.score);
      s().next();
      expect(s().round?.phase).toBe("complete");
      expect(s().players.map((p) => p.score)).toEqual(before);
    }
    expect(s().history).toHaveLength(3);
    expect(s().players.some((p) => p.score > 1000)).toBe(true);
    expect(s().players.every((p) => p.score <= 3000)).toBe(true);
  });
  it("allows a guesser to correctly identify the secret author from the player interface", () => {
    const s = () => useParty.getState();
    s().start("who");
    s().next();
    s().next();
    s().sim();
    s().next();
    s().setActive("p3");
    s().send("p0");
    expect(s().round?.votes.p3.value).toBe("p0");
  });
  it("allows answer overrides to change actual TV result scoring", () => {
    const s = () => useParty.getState();
    s().start("ballpark");
    s().next();
    s().next();
    s().sim();
    s().editSubmission("p0", "88", 3);
    s().next();
    expect(s().round?.points.p0).toBe(1000);
  });
});
