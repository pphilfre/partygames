import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    hostToken: v.string(),
    displayToken: v.string(),
    seats: v.array(v.object({ playerId: v.string(), token: v.string() })),
    night: v.any(),
    questions: v.any(),
    capacity: v.number(),
    lastTick: v.number(),
    expiresAt: v.number(),
  }).index("by_code", ["code"]),
});
