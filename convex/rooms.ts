import {
  mutationGeneric as mutation,
  queryGeneric as query,
  internalMutationGeneric as internalMutation,
  anyApi,
} from "convex/server";
import { ConvexError, v } from "convex/values";
import { makePlayers, type Question } from "../src/engine";
import { roomCode, setupIssues, type Night } from "../src/session/model";
import {
  commandLive,
  liveProjection,
  nextLive,
  submitLive,
} from "../src/session/liveEngine";

const credentials = { code: v.string(), token: v.string() };
async function find(ctx: any, code: string) {
  const room = await ctx.db
    .query("rooms")
    .withIndex("by_code", (q: any) => q.eq("code", code))
    .unique();
  if (!room || room.expiresAt < Date.now())
    throw new ConvexError(
      "Room not found or expired. Check the code with your host.",
    );
  return room;
}
function identity(room: any, token: string) {
  if (token === room.hostToken) return { host: true, playerId: "" };
  if (token === room.displayToken) return { host: false, playerId: "" };
  const seat = room.seats.find((s: any) => s.token === token);
  if (!seat)
    throw new ConvexError(
      "Your connection is no longer valid. Join the room again.",
    );
  return { host: false, playerId: seat.playerId };
}
const clean = <T>(value: T): T => JSON.parse(JSON.stringify(value));
async function save(ctx: any, room: any, night: Night) {
  await ctx.db.patch(room._id, { night: clean(night), lastTick: Date.now() });
  if (
    night.status === "playing" &&
    night.round &&
    (room.night.status !== "playing" || room.night.round?.id !== night.round.id)
  ) {
    await ctx.scheduler.runAfter(1000, anyApi.rooms.clock, {
      id: room._id,
      roundId: night.round.id,
    });
  }
}

export const create = mutation({
  args: {
    name: v.string(),
    capacity: v.number(),
    vibe: v.union(
      v.literal("easygoing"),
      v.literal("competitive"),
      v.literal("comfortable"),
    ),
    scoring: v.optional(v.object({ base: v.number(), speed: v.number() })),
    allowRepeats: v.boolean(),
    itinerary: v.array(
      v.object({
        id: v.string(),
        game: v.union(
          v.literal("bluff"),
          v.literal("who"),
          v.literal("ballpark"),
        ),
        rounds: v.number(),
        pack: v.string(),
      }),
    ),
    questions: v.array(
      v.object({
        id: v.string(),
        game: v.union(
          v.literal("bluff"),
          v.literal("who"),
          v.literal("ballpark"),
        ),
        text: v.string(),
        answer: v.string(),
        category: v.string(),
        pack: v.string(),
        enabled: v.boolean(),
        unit: v.optional(v.string()),
        tolerance: v.optional(v.number()),
        difficulty: v.optional(v.string()),
        explanation: v.optional(v.string()),
        source: v.optional(v.string()),
        sensitivity: v.optional(v.string()),
        guidance: v.optional(v.string()),
        skip: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    if (
      !Number.isInteger(args.capacity) ||
      args.capacity < 4 ||
      args.capacity > 24
    )
      throw new ConvexError("Choose 4–24 players.");
    if (
      args.scoring &&
      Object.values(args.scoring).some(
        (n) => !Number.isFinite(n) || n < 0 || n > 2000,
      )
    )
      throw new ConvexError("Scoring must be between 0 and 2000.");
    if (
      args.itinerary.length > 12 ||
      args.questions.length > 500 ||
      args.itinerary.some(
        (s) => !Number.isInteger(s.rounds) || s.rounds < 1 || s.rounds > 20,
      )
    )
      throw new ConvexError("Choose up to 12 games and 1–20 rounds per game.");
    const issues = setupIssues(
      args.questions,
      args.itinerary,
      args.capacity,
      args.allowRepeats,
    );
    if (issues.length) throw new ConvexError(issues[0]);
    let id = crypto.randomUUID(),
      code = roomCode({ id });
    while (
      await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first()
    ) {
      id = crypto.randomUUID();
      code = roomCode({ id });
    }
    const hostToken = crypto.randomUUID(),
      displayToken = crypto.randomUUID();
    const night: Night = {
      id,
      name: args.name.trim().slice(0, 80) || "Our game night",
      status: "lobby",
      itinerary: args.itinerary,
      segment: 0,
      roundNumber: 1,
      players: [],
      round: null,
      ledger: [],
      used: [],
      stamps: [],
      vibe: args.vibe,
      allowRepeats: args.allowRepeats,
      scoring: args.scoring,
      roleCounts: {},
      paused: false,
      lobby: { joined: [], locked: false, elapsed: 0 },
    };
    const roomId = await ctx.db.insert("rooms", {
      code,
      hostToken,
      displayToken,
      seats: [],
      night: clean(night),
      questions: args.questions,
      capacity: args.capacity,
      lastTick: Date.now(),
      expiresAt: Date.now() + 86400000,
    });
    await ctx.scheduler.runAfter(86400000, anyApi.rooms.expire, { id: roomId });
    return {
      code,
      token: hostToken,
      role: "host" as const,
      playerId: "",
      displayToken,
    };
  },
});

export const join = mutation({
  args: { code: v.string(), name: v.string(), token: v.string() },
  handler: async (ctx, { code, name, token }) => {
    const room = await find(ctx, code),
      n = room.night as Night;
    if (!/^[\w-]{20,100}$/.test(token))
      throw new ConvexError("Refresh this page and try joining again.");
    const seat = room.seats.find((s: any) => s.token === token);
    if (seat)
      return { code, token, role: "player" as const, playerId: seat.playerId };
    if (n.status !== "lobby" || n.lobby?.locked)
      throw new ConvexError(
        "This room is locked or already playing. Ask the host to reopen it.",
      );
    if (n.players.length >= room.capacity)
      throw new ConvexError("This room is full.");
    if (!name.trim()) throw new ConvexError("Enter your name.");
    if (
      n.players.some(
        (p) => p.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
      )
    )
      throw new ConvexError("That name is taken. Add a nickname.");
    const playerId = crypto.randomUUID();
    const p = {
      ...makePlayers(24)[n.players.length],
      avatar: String(n.players.length),
      id: playerId,
      name: name.trim().slice(0, 32),
    };
    n.players.push(p);
    n.lobby!.joined.push(playerId);
    await ctx.db.patch(room._id, {
      night: clean(n),
      seats: [...room.seats, { playerId, token }],
    });
    return { code, token, role: "player" as const, playerId };
  },
});

export const watch = query({
  args: credentials,
  handler: async (ctx, { code, token }) => {
    const room = await find(ctx, code),
      who = identity(room, token);
    return clean({
      night: liveProjection(room.night, who.playerId, who.host),
      capacity: room.capacity,
      role: who.host ? "host" : who.playerId ? "player" : "display",
      playerId: who.playerId,
      ...(who.host ? { displayToken: room.displayToken } : {}),
    });
  },
});

export const command = mutation({
  args: {
    ...credentials,
    action: v.string(),
    practice: v.optional(v.boolean()),
    roundId: v.optional(v.string()),
    phase: v.optional(v.string()),
    status: v.optional(v.string()),
    revealReady: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { code, token, action, practice, roundId, phase, status, revealReady },
  ) => {
    const room = await find(ctx, code);
    if (!identity(room, token).host)
      throw new ConvexError("Only the host can control this night.");
    if (
      status !== room.night.status ||
      roundId !== room.night.round?.id ||
      phase !== room.night.round?.phase ||
      revealReady !== room.night.round?.revealReady
    )
      throw new ConvexError("The room has moved on. Try again.");
    try {
      await save(
        ctx,
        room,
        commandLive(room.night, room.questions, action, practice),
      );
    } catch (e) {
      throw new ConvexError((e as Error).message);
    }
  },
});

export const send = mutation({
  args: {
    ...credentials,
    roundId: v.string(),
    phase: v.string(),
    value: v.string(),
  },
  handler: async (ctx, { code, token, roundId, phase, value }) => {
    const room = await find(ctx, code),
      who = identity(room, token);
    if (!who.playerId) throw new ConvexError("Join on a phone to play.");
    if (value.length > 500)
      throw new ConvexError("Keep your answer under 500 characters.");
    try {
      const night = submitLive(room.night, who.playerId, roundId, phase, value);
      await ctx.db.patch(room._id, { night: clean(night) });
    } catch (e) {
      throw new ConvexError((e as Error).message);
    }
  },
});

export const edit = mutation({
  args: {
    ...credentials,
    playerId: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    remove: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const room = await find(ctx, args.code),
      who = identity(room, args.token),
      n = room.night as Night;
    if (!who.host && who.playerId !== args.playerId)
      throw new ConvexError("You can only edit your own player.");
    if (n.status !== "lobby")
      throw new ConvexError("Players can be edited in the lobby.");
    if (args.remove) {
      n.players = n.players.filter((p) => p.id !== args.playerId);
      n.lobby!.joined = n.lobby!.joined.filter((id) => id !== args.playerId);
      await ctx.db.patch(room._id, {
        seats: room.seats.filter((s: any) => s.playerId !== args.playerId),
      });
    } else
      n.players = n.players.map((p) =>
        p.id === args.playerId
          ? {
              ...p,
              name:
                args.name === undefined
                  ? p.name
                  : args.name.trim().slice(0, 32) || "Guest",
              avatar: args.avatar?.slice(0, 300) || p.avatar,
            }
          : p,
      );
    await ctx.db.patch(room._id, { night: clean(n) });
  },
});

export const clock = internalMutation({
  args: { id: v.id("rooms"), roundId: v.string() },
  handler: async (ctx, { id, roundId }) => {
    const room = await ctx.db.get(id);
    if (!room || room.expiresAt < Date.now()) return;
    let n = room.night as Night;
    if (n.status !== "playing" || !n.round || n.round.id !== roundId) return;
    const elapsed = Math.max(
      1,
      Math.floor((Date.now() - room.lastTick) / 1000),
    );
    if (!n.paused) {
      const r = n.round;
      if (r.phase === "reveal" && !r.revealReady)
        n = {
          ...n,
          round: {
            ...r,
            revealElapsed: r.revealElapsed + elapsed * 4,
            revealReady: r.revealElapsed + elapsed * 4 >= 20,
          },
        };
      else if (
        ["countdown", "writing", "voting"].includes(r.phase) &&
        (n.vibe !== "comfortable" || r.phase === "countdown")
      ) {
        n = {
          ...n,
          round: { ...r, remaining: Math.max(0, r.remaining - elapsed) },
        };
        if (r.phase === "countdown" && n.round!.remaining === 0)
          n = nextLive(n, room.questions as Question[]);
      }
    }
    // Ballpark's phone result waits for the shared reveal, even with no display tab open.
    if (
      n.round?.phase === "reveal" &&
      n.round.revealReady &&
      n.round.game === "ballpark"
    ) {
      const r = n.round,
        revealElapsed = r.revealElapsed + elapsed * 4;
      n = {
        ...n,
        round: {
          ...r,
          revealElapsed,
          ballparkPresented:
            r.ballparkPresented ||
            revealElapsed >= 28 + Object.keys(r.answers).length * 5,
        },
      };
    }
    await ctx.db.patch(id, { night: clean(n), lastTick: Date.now() });
    await ctx.scheduler.runAfter(1000, anyApi.rooms.clock, { id, roundId });
  },
});

export const expire = internalMutation({
  args: { id: v.id("rooms") },
  handler: async (ctx, { id }) => {
    const room = await ctx.db.get(id);
    if (room && room.expiresAt <= Date.now()) await ctx.db.delete(id);
  },
});
