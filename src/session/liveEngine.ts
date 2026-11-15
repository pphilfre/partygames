import { advance, submit, type Question } from "../engine";
import { awarded, makeRound, timer } from "./core";
import {
  completion,
  hash,
  setupIssues,
  type Night,
  type NightRound,
} from "./model";
import { normalizeOptions, simulateOne } from "./simulation";

export function beginLive(
  n: Night,
  library: Question[],
  practice = false,
): Night {
  const r = makeRound(
    n,
    hash(Date.now(), n.id),
    practice,
    false,
    undefined,
    library,
    n.scoring,
  );
  return {
    ...n,
    status: "playing",
    paused: false,
    round: r,
    used: practice ? n.used : [...n.used, r.question.id],
  };
}

export function nextLive(n: Night, library: Question[]): Night {
  if (n.paused) throw Error("Resume the night first.");
  if (n.status === "lobby") {
    const issues = setupIssues(
      library,
      n.itinerary,
      n.players.length,
      n.allowRepeats,
      n.used,
    );
    if (issues.length) throw Error(issues[0]);
    return {
      ...n,
      status: "intro",
      lobby: { joined: n.players.map((p) => p.id), locked: true, elapsed: 0 },
    };
  }
  if (["intro", "transition"].includes(n.status))
    return beginLive(n, library, true);
  const r = n.round;
  if (!r) return n;
  if (r.phase === "reveal")
    return {
      ...n,
      round: r.revealReady
        ? { ...r, phase: "standings" }
        : { ...r, revealReady: true, revealElapsed: 32 },
    };
  if (r.phase === "standings") {
    if (r.practice) return beginLive(n, library);
    if (n.roundNumber < n.itinerary[n.segment].rounds)
      return beginLive({ ...n, roundNumber: n.roundNumber + 1 }, library);
    const stamps = [...new Set([...n.stamps, n.itinerary[n.segment].id])];
    return n.segment < n.itinerary.length - 1
      ? {
          ...n,
          stamps,
          status: "transition",
          segment: n.segment + 1,
          roundNumber: 1,
          round: null,
        }
      : { ...n, stamps, status: "finale", round: null };
  }
  let source = r;
  if (r.phase === "writing") {
    const c = completion(r);
    if (r.game === "ballpark" && !c.received)
      throw Error(
        "At least one estimate is needed. Add time or replace the prompt.",
      );
    if (r.game === "who") {
      const answered = r.participants.filter((id) => r.answers[id]);
      if (!answered.length) throw Error("At least one answer is needed.");
      const least = Math.min(...answered.map((id) => n.roleCounts[id] || 0));
      const pool = answered.filter((id) => (n.roleCounts[id] || 0) === least);
      source = { ...r, author: pool[hash(r.seed, r.id) % pool.length] };
    }
  }
  let next = advance(
    source,
    n.players,
    timer(n, r.phase === "writing" ? "voting" : "writing"),
  ) as NightRound;
  if (next.phase === "voting")
    next = normalizeOptions(next, r.seed) as NightRound;
  return next.phase === "reveal" ? awarded(n, next) : { ...n, round: next };
}

export function submitLive(
  n: Night,
  playerId: string,
  roundId: string,
  phase: string,
  value: string,
): Night {
  const r = n.round;
  if (!r || r.id !== roundId || r.phase !== phase)
    throw Error("The round has moved on. Try the current question.");
  if (n.paused) throw Error("Paused by host. Your draft is saved.");
  const player = n.players.find((p) => p.id === playerId);
  if (!player) throw Error("Your seat is no longer in this room.");
  const choice =
    r.game === "bluff" && r.phase === "voting"
      ? r.options[Number(value.replace("choice-", ""))]?.id || ""
      : value;
  return {
    ...n,
    round: submit(
      r,
      player,
      choice,
      Math.max(0, r.duration - r.remaining),
    ) as NightRound,
  };
}

export function commandLive(
  n: Night,
  library: Question[],
  action: string,
  practice = false,
): Night {
  if (action === "next" || action === "startNight") return nextLive(n, library);
  if (action === "begin") {
    if (!["intro", "transition"].includes(n.status))
      throw Error("A game is already running.");
    return beginLive(n, library, practice);
  }
  if (action === "pause" || action === "resume") {
    const paused = action === "pause" ? !n.paused : false;
    return { ...n, paused, round: n.round ? { ...n.round, paused } : null };
  }
  if (action === "lockLobby" && n.status === "lobby")
    return {
      ...n,
      lobby: {
        joined: n.players.map((p) => p.id),
        locked: !n.lobby?.locked,
        elapsed: 0,
      },
    };
  if (action === "finish")
    return { ...n, status: "finale", paused: false, round: null };
  if (action === "rematch") {
    const players = n.players.map((p) => ({
      ...p,
      score: 0,
      previous: 0,
      previousScore: 0,
      streak: 0,
      games: { bluff: 0, who: 0, ballpark: 0 },
      played: { bluff: 0, who: 0, ballpark: 0 },
    }));
    return {
      ...n,
      players,
      status: "lobby",
      paused: false,
      round: null,
      ledger: [],
      used: [],
      stamps: [],
      segment: 0,
      roundNumber: 1,
      lobby: { joined: players.map((p) => p.id), locked: false, elapsed: 0 },
    };
  }
  const r = n.round;
  if (!r) return n;
  if (action === "presented")
    return { ...n, round: { ...r, ballparkPresented: true } };
  if (action === "addTime" && ["writing", "voting"].includes(r.phase))
    return {
      ...n,
      round: {
        ...r,
        remaining: Math.min(120, r.remaining + 10),
        duration: r.duration + 10,
      },
    };
  if (action === "skip" && !r.awarded) {
    const fresh = beginLive(n, library, r.practice);
    return {
      ...fresh,
      round: {
        ...fresh.round!,
        phase: "writing",
        remaining: timer(n),
        duration: timer(n),
      },
    };
  }
  if (action === "fallback" && r.phase === "writing") {
    let round = { ...r, remaining: Math.max(10, r.remaining) };
    completion(round).missing.forEach((id) => {
      round = simulateOne(
        round,
        n.players.find((p) => p.id === id)!,
      );
      round = { ...round, fallbacks: [...round.fallbacks, id] };
    });
    return { ...n, round };
  }
  throw Error("That action is unavailable in this phase.");
}

// This projection runs on the server, before any data reaches a phone or display.
export function liveProjection(
  night: Night,
  playerId = "",
  host = false,
): Night {
  const n = structuredClone(night),
    r = n.round;
  if (!r) return n;
  const released =
    r.phase === "standings" ||
    r.phase === "complete" ||
    (r.phase === "reveal" && r.revealReady);
  if (released) return n;
  r.liveCompletion = { ...completion(r), missing: [] };
  const quote = r.answers[r.author];
  const author = r.author;
  const originalOptions = r.options;
  r.question = { ...r.question, answer: "", explanation: "", source: "" };
  r.answers = Object.fromEntries(
    Object.entries(r.answers).map(([id, a]) => [
      id,
      id === playerId ? a : { value: "", seconds: 0 },
    ]),
  );
  r.votes = Object.fromEntries(
    Object.entries(r.votes).map(([id, a]) => [
      id,
      id === playerId ? a : { value: "", seconds: 0 },
    ]),
  );
  r.options = originalOptions.map((o, i) => ({
    id: `option-${i}`,
    text: o.text,
  }));
  if (r.game === "bluff" && r.votes[playerId]) {
    const index = originalOptions.findIndex(
      (o) => o.id === r.votes[playerId].value,
    );
    r.votes[playerId].value = `option-${index}`;
  }
  if (r.game === "bluff" && r.phase === "reveal") {
    r.votes = Object.fromEntries(
      Object.entries(night.round!.votes).map(([id, vote], i) => [
        id === playerId ? id : `anonymous-vote-${i}`,
        {
          value: `option-${originalOptions.findIndex((o) => o.id === vote.value)}`,
          seconds: 0,
        },
      ]),
    );
  }
  if (r.game === "who" && ["voting", "reveal"].includes(r.phase) && quote) {
    r.author = author === playerId ? playerId : "anonymous";
    r.answers[r.author] = quote;
  } else r.author = "";
  // Bluff writers may see their own role; the shared display doesn't name writers.
  if (!host) r.bluffers = r.bluffers.includes(playerId) ? [playerId] : [];
  r.points = {};
  r.bonuses = {};
  r.streaks = {};
  n.roleCounts = {};
  n.ledger = n.ledger.filter((l) => l.id !== r.id);
  // Awarding happens before the suspense animation. Keep those scores private too.
  const before = night.ledger.find((l) => l.id === r.id)?.players;
  if (before) n.players = structuredClone(before);
  return n;
}
