import { ConvexClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { create } from "zustand";
import type { Night } from "./model";

export type Connection = {
  code: string;
  token: string;
  role: "host" | "player" | "display";
  playerId: string;
  displayToken?: string;
};
export type RoomView = {
  night: Night;
  capacity: number;
  role: Connection["role"];
  playerId: string;
  displayToken?: string;
};
const url = import.meta.env.VITE_CONVEX_URL;
export const liveConfigured = !!url;
export const phoneToken = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
let client: ConvexClient | undefined;
export function convex() {
  if (!url)
    throw Error(
      "Live mode needs VITE_CONVEX_URL. Add it to .env.local and restart the app.",
    );
  return (client ??= new ConvexClient(url));
}
export const roomQuery = makeFunctionReference<
  "query",
  { code: string; token: string },
  RoomView
>("rooms:watch");
export const roomMutation = (name: string) =>
  makeFunctionReference<"mutation">(`rooms:${name}`);
export function errorText(e: unknown) {
  const data = (e as { data?: unknown })?.data;
  return typeof data === "string"
    ? data
    : e instanceof Error
      ? e.message
      : "Could not connect. Check your connection and try again.";
}
export function remember(connection: Connection) {
  localStorage.setItem(
    `afterparty-live-${connection.role}-${connection.code}`,
    JSON.stringify(connection),
  );
  localStorage.setItem(`afterparty-last-${connection.role}`, connection.code);
}
export function recalled(
  role: Connection["role"],
  code: string,
): Connection | null {
  try {
    return JSON.parse(
      localStorage.getItem(`afterparty-live-${role}-${code}`) || "null",
    );
  } catch {
    return null;
  }
}
export function lastHost() {
  try {
    const code = localStorage.getItem("afterparty-last-host");
    return code ? recalled("host", code) : null;
  } catch {
    return null;
  }
}
export const useLiveStatus = create<{
  pending: boolean;
  connected: boolean;
  error: string;
}>(() => ({ pending: false, connected: false, error: "" }));

export function appJoinUrl(base: string, code: string) {
  const url = new URL("/join", base);
  url.searchParams.set("room", code);
  return url.toString();
}
