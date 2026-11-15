import { describe, expect, it } from "vitest";
import { defaults, makePlayers } from "../engine";
import {
  beginLive,
  commandLive,
  liveProjection,
  nextLive,
  submitLive,
} from "./liveEngine";
import { starter, type Night } from "./model";

function night(game: "ballpark" | "bluff" | "who" = "ballpark"): Night {
  return {
    id: "live-test",
    name: "Live",
    status: "intro",
    itinerary: starter(1).filter((s) => s.game === game),
    segment: 0,
    roundNumber: 1,
    players: makePlayers(4),
    round: null,
    ledger: [],
    used: [],
    stamps: [],
    vibe: "competitive",
    allowRepeats: false,
    roleCounts: {},
    paused: false,
  };
}
function writing(game: "ballpark" | "bluff" | "who" = "ballpark") {
  return nextLive(beginLive(night(game), defaults), defaults);
}
describe("authoritative live games", () => {
  it("rejects stale phases, duplicate locked answers, and paused inputs", () => {
    let n = writing("who"),
      r = n.round!;
    expect(() => submitLive(n, "p0", "stale", r.phase, "hello")).toThrow(
      /moved on/,
    );
    expect(() => submitLive(n, "p0", r.id, "voting", "hello")).toThrow(
      /moved on/,
    );
    n = submitLive(n, "p0", r.id, r.phase, "hello");
    expect(() => submitLive(n, "p0", r.id, r.phase, "again")).toThrow(
      /already locked/,
    );
    expect(() =>
      submitLive(
        commandLive(n, defaults, "pause"),
        "p1",
        r.id,
        r.phase,
        "hello",
      ),
    ).toThrow(/Paused/);
  });
  it("preserves estimates, scores once, and finishes into a resettable rematch", () => {
    let n = writing();
    const r = n.round!;
    for (const p of n.players)
      n = submitLive(n, p.id, r.id, "writing", r.question.answer);
    n = nextLive(n, defaults);
    const scores = n.players.map((p) => p.score);
    expect(n.ledger).toHaveLength(1);
    n = nextLive(n, defaults);
    n = nextLive(n, defaults);
    expect(n.players.map((p) => p.score)).toEqual(scores);
    expect(n.ledger).toHaveLength(1);
    n = nextLive(n, defaults);
    expect(n.status).toBe("finale");
    n = commandLive(n, defaults, "rematch");
    expect(n.status).toBe("lobby");
    expect(n.players).toHaveLength(4);
    expect(n.players.every((p) => p.score === 0)).toBe(true);
  });
  it("keeps practice unscored", () => {
    let n = nextLive(beginLive(night(), defaults, true), defaults);
    n = submitLive(n, "p0", n.round!.id, "writing", "3");
    n = nextLive(n, defaults);
    expect(n.ledger).toHaveLength(0);
    expect(n.players.every((p) => p.score === 0)).toBe(true);
  });
});
describe("server projections", () => {
  it("hides other estimates, truth and already-calculated scores until release", () => {
    let n = writing();
    const r = n.round!;
    n = submitLive(n, "p0", r.id, "writing", "123456");
    n = nextLive(n, defaults);
    const phone = liveProjection(n, "p1");
    expect(phone.round!.question.answer).toBe("");
    expect(phone.round!.answers.p0.value).toBe("");
    expect(phone.ledger).toHaveLength(0);
    expect(phone.players.every((p) => p.score === 0)).toBe(true);
    expect(phone.round!.points).toEqual({});
    n = nextLive(n, defaults);
    expect(liveProjection(n, "p1").round!.answers.p0.value).toBe("123456");
  });
  it("publishes an anonymous Guess Who quote without revealing the selected author", () => {
    let n = writing("who");
    for (const p of n.players)
      n = submitLive(n, p.id, n.round!.id, "writing", `secret-${p.id}`);
    n = nextLive(n, defaults);
    const author = n.round!.author,
      voter = n.players.find((p) => p.id !== author)!.id;
    const view = liveProjection(n, voter);
    expect(view.round!.author).toBe("anonymous");
    expect(view.round!.answers.anonymous.value).toBe(`secret-${author}`);
    expect(view.round!.answers[author].value).toBe("");
    expect(view.roleCounts).toEqual({});
    expect(view.round!.liveCompletion!.missing).toEqual([]);
    expect(liveProjection(n, author).round!.author).toBe(author);
  });
  it("does not identify the truth or bluff authors in options", () => {
    let n = writing("bluff");
    for (const id of n.round!.bluffers)
      n = submitLive(n, id, n.round!.id, "writing", `invented-${id}`);
    n = nextLive(n, defaults);
    const view = liveProjection(n, "p0");
    expect(
      view.round!.options.every((o) => o.id.startsWith("option-") && !o.author),
    ).toBe(true);
    expect(view.round!.question.answer).toBe("");
    expect(view.round!.bluffers.every((id) => id === "p0")).toBe(true);
  });
  it("shows anonymous Bluff vote totals during suspense without identifying the truth", () => {
    let n = writing("bluff");
    for (const id of n.round!.bluffers)
      n = submitLive(n, id, n.round!.id, "writing", `invented-${id}`);
    n = nextLive(n, defaults);
    const voter = n.players.find((p) => !n.round!.bluffers.includes(p.id))!;
    n = submitLive(n, voter.id, n.round!.id, "voting", "choice-0");
    n = nextLive(n, defaults);
    const display = liveProjection(n);
    expect(Object.keys(display.round!.votes)).toEqual(["anonymous-vote-0"]);
    expect(display.round!.votes["anonymous-vote-0"].value).toBe("option-0");
    expect(display.round!.options.every((o) => o.id !== "truth")).toBe(true);
  });
});
