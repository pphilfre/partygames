// The demo store remains the UI adapter. A live room replaces mutations only
// while its route is mounted, and never writes live snapshots into demo storage.
type Transport = (action: string, ...args: any[]) => boolean;
let transport: Transport | null = null;
let snapshot: Record<string, any> | null = null;
export const liveAction = (action: string, ...args: any[]) =>
  transport?.(action, ...args) ?? false;
export const liveActive = () => transport !== null;
export const demoSnapshot = () => snapshot;
export function setLiveTransport(
  value: Transport | null,
  saved: Record<string, any> | null = null,
) {
  transport = value;
  snapshot = saved;
}
