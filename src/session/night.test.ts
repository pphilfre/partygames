import { beforeEach, describe, expect, it } from "vitest";
import { calculate, defaults, makePlayers, newRound, submit } from "../engine";
import { useParty } from "../store";
import {
  completion,
  playerProjection,
  publicProjection,
  setupIssues,
  starter,
  roomCode,
  lobbyPlayers,
} from "./model";
import { useNight } from "./store";

const state = () => useNight.getState();
function create(rounds = 1, count = 8) {
  state().createNight({
    name: "Test night",
    count,
    itinerary: starter(rounds),
    vibe: "easygoing",
    allowRepeats: false,
    seed: 42,
  });
  state().fillLobby();
  state().startNight();
}
function start(practice = false) {
  state().begin(practice);
  for (let i = 0; i < 12; i++) state().tick();
  expect(state().night!.round!.phase).toBe("writing");
}
function fill() {
  const n = state().night!,
    r = n.round!;
  useNight.setState({
    demo: { ...state().demo, controlled: "outside", preview: "p0" },
  });
  state().fill();
  if (r.game !== "ballpark") {
    state().next();
    state().fill();
  }
  state().next();
}
function finishRound() {
  fill();
  state().next();
  state().next();
}
beforeEach(() => {
  state().reset();
  useParty.setState({ questions: defaults });
});

describe("the waiting room", () => {
  const open = () =>
    state().createNight({
      name: "Friday",
      count: 8,
      itinerary: starter(1),
      vibe: "easygoing",
      allowRepeats: false,
      seed: 42,
    });
  it("waits for four arrivals and starts with only the joined cast", () => {
    open();
    expect(lobbyPlayers(state().night!)).toHaveLength(1);
    state().startNight();
    expect(state().night!.status).toBe("lobby");
    for (let i = 0; i < 12; i++) state().tick();
    expect(lobbyPlayers(state().night!)).toHaveLength(4);
    state().startNight();
    expect(state().night!.status).toBe("intro");
    expect(state().night!.players).toHaveLength(4);
    start();
    expect(state().night!.round!.participants).toHaveLength(4);
  });
  it("validates the code and name, then joins once with a trimmed name", () => {
    open();
    const pin = roomCode(state().night!);
    state().leaveLobby();
    expect(state().joinLobby("wrong", "Freddie")).toBe(false);
    expect(state().joinLobby(pin, "  ")).toBe(false);
    expect(
      state().joinLobby(`${pin.slice(0, 3)} ${pin.slice(3)}`, " Freddie "),
    ).toBe(true);
    state().joinLobby(pin, "Freddie");
    expect(lobbyPlayers(state().night!)).toHaveLength(1);
    expect(state().night!.players[0].name).toBe("Freddie");
  });
  it("locking blocks automatic arrivals, fill, and code joins until unlocked", () => {
    open();
    state().leaveLobby();
    state().lockLobby();
    state().fillLobby();
    for (let i = 0; i < 20; i++) state().tick();
    expect(lobbyPlayers(state().night!)).toHaveLength(0);
    expect(state().joinLobby(roomCode(state().night!), "Freddie")).toBe(false);
    state().lockLobby();
    expect(state().joinLobby(roomCode(state().night!), "Freddie")).toBe(true);
    state().fillLobby();
    expect(lobbyPlayers(state().night!)).toHaveLength(8);
  });
  it("auto-play off leaves the waiting room under manual control", () => {
    open();
    state().setDemo({ auto: false });
    for (let i = 0; i < 20; i++) state().tick();
    expect(lobbyPlayers(state().night!)).toHaveLength(1);
    state().fillLobby();
    expect(lobbyPlayers(state().night!)).toHaveLength(8);
  });
  it("supports saved lobbies from before arrival tracking", () => {
    open();
    useNight.setState({ night: { ...state().night!, lobby: undefined } });
    expect(lobbyPlayers(state().night!)).toHaveLength(8);
    state().startNight();
    expect(state().night!.status).toBe("intro");
  });
});
describe("game-night orchestration", () => {
  it("plays a complete nine-round mixed night without changing games manually", () => {
    create(3);
    start();
    for (let i = 0; i < 9; i++) {
      fill();
      expect(state().night!.round!.phase).toBe("reveal");
      state().next();
      state().next();
      state().next();
      if (state().night!.status === "transition") start();
      else if (state().night!.status === "playing")
        for (let j = 0; j < 12; j++) state().tick();
    }
    expect(state().night!.status).toBe("finale");
    expect(state().night!.ledger).toHaveLength(9);
    expect(state().night!.stamps).toHaveLength(3);
    expect(state().night!.players.every((p) => p.score <= 3000)).toBe(true);
  });
  it("practice changes no points, history, role counts, stamps, or streaks", () => {
    create();
    start(true);
    const before = structuredClone(state().night!.players);
    finishRound();
    expect(state().night!.round!.phase).toBe("standings");
    expect(state().night!.players).toEqual(before);
    expect(state().night!.ledger).toEqual([]);
    expect(state().night!.stamps).toEqual([]);
    expect(state().night!.roleCounts).toEqual({});
    state().next();
    expect(state().night!.round!.practice).toBe(false);
  });
  it("commits at reveal once and fast-forward/replaying cannot score again", () => {
    create();
    start();
    fill();
    const points = state().night!.players.map((p) => p.score);
    expect(state().night!.ledger).toHaveLength(1);
    state().next();
    expect(state().night!.players.map((p) => p.score)).toEqual(points);
    state().replay();
    for (let i = 0; i < 12; i++) state().tick();
    fill();
    expect(state().night!.players.map((p) => p.score)).toEqual(points);
    expect(state().night!.ledger).toHaveLength(1);
  });
  it("voids the current result, restores before scores, and keeps an auditable replacement", () => {
    create();
    start();
    fill();
    state().voidResult();
    expect(state().night!.players.every((p) => p.score === 0)).toBe(true);
    expect(state().night!.ledger[0].voided).toBe(true);
    for (let i = 0; i < 12; i++) state().tick();
    fill();
    expect(state().night!.ledger).toHaveLength(2);
    expect(state().night!.ledger.filter((l) => !l.voided)).toHaveLength(1);
  });
  it("auto-play excludes the controlled player and preserves accepted updates", () => {
    create();
    start();
    expect(state().send("86")).toBe(true);
    expect(state().send("-273.15")).toBe(true);
    for (let i = 0; i < 40; i++) state().tick();
    expect(state().night!.round!.answers.p0.value).toBe("-273.15");
    expect(Object.keys(state().night!.round!.answers)).toHaveLength(8);
  });
  it("preview changes do not transfer control or erase drafts", () => {
    create();
    start();
    state().draft("12.5");
    state().setDemo({ preview: "p4" });
    expect(state().demo.controlled).toBe("p0");
    state().setDemo({ preview: "p0" });
    expect(Object.values(state().drafts)).toContain("12.5");
    expect(state().night!.round!.phase).toBe("writing");
  });
  it("pauses the clock, all input, and simulation without clearing drafts", () => {
    create();
    start();
    state().draft("88");
    state().pause();
    const before = structuredClone(state().night!.round);
    for (let i = 0; i < 60; i++) state().tick();
    expect(state().night!.round).toEqual(before);
    expect(state().send("88")).toBe(false);
    expect(Object.values(state().drafts)).toContain("88");
    state().resume();
    expect(state().send("88")).toBe(true);
  });
  it("closes inputs at zero but allows explicit extra time", () => {
    create();
    start();
    useNight.setState({
      demo: { ...state().demo, auto: false },
      night: {
        ...state().night!,
        round: { ...state().night!.round!, remaining: 1 },
      },
    });
    for (let i = 0; i < 4; i++) state().tick();
    expect(state().send("88")).toBe(false);
    state().addTime();
    expect(state().send("88")).toBe(true);
  });
  it("comfortable mode removes countdown pressure and speed points", () => {
    state().scenario("Comfortable mode");
    state().startNight();
    start();
    for (let i = 0; i < 120; i++) state().tick();
    expect(state().night!.round!.remaining).toBe(86400);
    expect(state().night!.round!.rules.speed).toBe(0);
  });
  it("freezes result release for every role until the shared cue", () => {
    create();
    start();
    fill();
    let n = state().night!;
    expect(publicProjection(n)!.result).toBeUndefined();
    expect(playerProjection(n, "p0")!.result).toBeUndefined();
    for (let i = 0; i < 20; i++) state().tick();
    n = state().night!;
    expect(publicProjection(n)!.result).toBeDefined();
    expect(playerProjection(n, "p0")!.result).toBeDefined();
  });
  it("stops updating a settled reveal while the host holds the result", () => {
    create();
    start();
    fill();
    state().next();
    const before = state().night!.round;
    for (let i = 0; i < 100; i++) state().tick();
    expect(state().night!.round).toBe(before);
    expect(state().night!.ledger).toHaveLength(1);
  });
  it("does not disclose the secret author or private answers in the public projection", () => {
    state().scenario("Be the secret author");
    state().send("My private answer");
    const projection = publicProjection(state().night!)!;
    expect(projection.result).toBeUndefined();
    expect(projection.quote).toBeUndefined();
    expect(JSON.stringify(projection)).not.toContain("My private answer");
    expect(projection).not.toHaveProperty("author");
  });
  it("offers a real private skip with no award or role penalty", () => {
    state().scenario("Be the secret author");
    const old = state().night!.round!.question.id;
    const author = state().night!.round!.author;
    state().skip();
    expect(state().night!.round!.author).toBe(author);
    expect(state().night!.round!.question.id).not.toBe(old);
    expect(state().night!.ledger).toHaveLength(0);
    expect(state().night!.roleCounts).toEqual({});
  });
  it("keeps a replay unscored even if its prompt is replaced", () => {
    create();
    start();
    fill();
    const scores = state().night!.players.map((p) => p.score);
    state().replay();
    for (let i = 0; i < 12; i++) state().tick();
    state().skip();
    expect(state().night!.round!.replay).toBe(true);
    fill();
    expect(state().night!.players.map((p) => p.score)).toEqual(scores);
    expect(state().night!.ledger).toHaveLength(1);
  });
  it("starts the waiting scenario with exactly one missing answer", () => {
    state().scenario("Waiting on one player");
    expect(completion(state().night!.round!).missing).toEqual(["p7"]);
  });
  it("defers removal and preserves active-round snapshots and accepted input", () => {
    create();
    start();
    state().send("88");
    state().removePlayer("p0");
    expect(state().night!.round!.answers.p0.value).toBe("88");
    expect(state().night!.round!.participants).toContain("p0");
    expect(state().night!.players[0].connected).toBe(false);
  });
  it("fallback answers never credit a human bluff author", () => {
    state().scenario("Write a bluff");
    state().fallback();
    expect(state().night!.round!.fallbacks).toContain("p0");
    state().next();
    state().setDemo({ controlled: "outside" });
    state().fill();
    state().next();
    expect(state().night!.round!.points.p0).toBe(0);
  });
  it("validates shortages across repeated segments instead of cycling silently", () => {
    const itinerary = [
      ...starter(3).filter((s) => s.game === "bluff"),
      { id: "again", game: "bluff" as const, rounds: 4, pack: "all" },
    ];
    expect(setupIssues(defaults, itinerary, 8, false)).toHaveLength(1);
    expect(setupIssues(defaults, itinerary, 8, true)).toHaveLength(0);
  });
  it("restores persisted accepted input in a paused night with no duplicate award", async () => {
    create();
    start();
    state().send("88");
    await useNight.persist.rehydrate();
    expect(state().needsResume).toBe(true);
    expect(state().night!.paused).toBe(true);
    expect(state().night!.round!.answers.p0.value).toBe("88");
    state().resume();
    expect(state().night!.round!.remaining).toBeGreaterThan(0);
  });
  it.each([4, 8, 24])("keeps reveal time bounded for %i players", (count) => {
    create(1, count);
    start();
    fill();
    for (let i = 0; i < 20; i++) state().tick();
    expect(state().night!.round!.revealReady).toBe(true);
    expect(state().night!.ledger).toHaveLength(1);
  });
});
describe("rules and eligibility", () => {
  it("preserves custom questions and settings when migrating the previous prototype save", async () => {
    const custom = {
      ...defaults[0],
      id: "my-custom",
      text: "My own party question",
    };
    localStorage.setItem(
      "afterparty-v1",
      JSON.stringify({
        state: {
          questions: [custom],
          settings: { sound: true, party: "Saved party" },
          players: makePlayers(4),
          history: [],
        },
        version: 0,
      }),
    );
    await useParty.persist.rehydrate();
    expect(useParty.getState().questions).toContainEqual(custom);
    expect(
      useParty.getState().questions.filter((q) => q.id.startsWith("party-w")),
    ).toHaveLength(6);
    expect(useParty.getState().settings.sound).toBe(true);
    expect(useParty.getState().settings.haptics).toBe(true);
  });
  it("rematches keep the cast and role queue, reset scores, and choose fresh prompts", () => {
    create();
    start();
    for (let i = 0; i < 3; i++) {
      fill();
      state().next();
      state().next();
      state().next();
      if (i < 2) start();
    }
    const old = state().night!;
    const used = [...old.used];
    state().rematch();
    expect(state().night!.status).toBe("lobby");
    expect(state().night!.players.map((p) => p.name)).toEqual(
      old.players.map((p) => p.name),
    );
    expect(state().night!.players.every((p) => p.score === 0)).toBe(true);
    expect(state().night!.roleCounts).toEqual(old.roleCounts);
    state().startNight();
    start();
    expect(used).not.toContain(state().night!.round!.question.id);
  });
  it("rejects normalized duplicate bluffs and truth matches", () => {
    const players = makePlayers(8);
    let r = {
      ...newRound("bluff", 1, players, defaults, 30),
      phase: "writing" as const,
    };
    expect(() => submit(r, players[0], " a UNICORN ", 2)).toThrow(
      "already in the mix",
    );
    r = submit(r, players[0], "A flying cow", 2) as typeof r;
    expect(() => submit(r, players[1], "a  flying COW", 2)).toThrow(
      "already in the mix",
    );
  });
  it("uses frozen participation for author denominators and excludes late arrivals", () => {
    const players = makePlayers(8);
    let r = {
      ...newRound("who", 1, players, defaults, 30),
      phase: "voting" as const,
    };
    r.votes = { p1: { value: "p2", seconds: 3 } };
    const before = calculate(r, players);
    const changed = players.map((p) => ({ ...p, connected: false }));
    expect(
      calculate(r, [
        ...changed,
        ...makePlayers(1).map((p) => ({ ...p, id: "late" })),
      ]),
    ).toEqual(before);
    expect(before).not.toHaveProperty("late");
  });
});

describe("Guess Who shared writing", () => {
  function openWho() {
    state().createNight({
      name: "Fourteen",
      count: 14,
      itinerary: [{ id: "who", game: "who", rounds: 2, pack: "starter" }],
      vibe: "easygoing",
      allowRepeats: false,
      seed: 42,
    });
    state().fillLobby();
    state().startNight();
    start();
  }
  it("lets all 14 answer, then exposes one quote and accepts one guess per player", () => {
    openWho();
    expect(completion(state().night!.round!).required).toBe(14);
    for (const p of state().night!.players) {
      state().setDemo({ controlled: p.id, preview: p.id });
      expect(playerProjection(state().night!, p.id)!.canAct).toBe(true);
      expect(state().send("Answer by " + p.name)).toBe(true);
    }
    expect(completion(state().night!.round!).received).toBe(14);
    expect(publicProjection(state().night!)!.quote).toBeUndefined();
    state().next();
    const n = state().night!,
      r = n.round!;
    expect(publicProjection(n)!.quote).toBe(r.answers[r.author].value);
    expect(publicProjection(n)!.result).toBeUndefined();
    const guesser = r.participants.find((id) => id !== r.author)!;
    state().setDemo({ controlled: guesser, preview: guesser });
    expect(state().send(r.author)).toBe(true);
    expect(
      state().send(
        r.participants.find((id) => id !== guesser && id !== r.author)!,
      ),
    ).toBe(false);
    expect(state().night!.round!.votes[guesser].value).toBe(r.author);
    state().setDemo({ controlled: r.author, preview: r.author });
    expect(state().send(guesser)).toBe(false);
  });
  it("only selects a submitted answer", () => {
    openWho();
    state().setDemo({ controlled: "p9", preview: "p9" });
    expect(state().send("Only this answer is submitted")).toBe(true);
    state().next();
    expect(state().night!.round!.author).toBe("p9");
    expect(publicProjection(state().night!)!.quote).toBe(
      "Only this answer is submitted",
    );
  });
  it("prefers players whose answers have been selected fewer times", () => {
    openWho();
    useNight.setState({
      night: { ...state().night!, roleCounts: { p0: 2, p1: 0 } },
    });
    state().setDemo({ controlled: "p0", preview: "p0" });
    state().send("Already selected twice");
    state().setDemo({ controlled: "p1", preview: "p1" });
    state().send("Not selected yet");
    state().next();
    expect(state().night!.round!.author).toBe("p1");
  });
});
