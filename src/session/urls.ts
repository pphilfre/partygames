export function isLoopbackAddress(address: string) {
  const host = new URL(address).hostname;
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "[::1]" ||
    /^127\./.test(host)
  );
}

export function resolveJoinBase(
  origin: string,
  saved?: string | null,
  configured?: string,
) {
  // Hosted, preview and custom domains always join on the domain being visited.
  // Local Wi-Fi overrides only apply when the host opened the app on loopback.
  const current = new URL(origin).origin;
  if (!isLoopbackAddress(current)) return current;
  for (const candidate of [configured, saved]) {
    try {
      if (!candidate) continue;
      const url = new URL(candidate);
      if (
        ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      )
        return url.origin;
    } catch {
      /* Ignore stale or incomplete local settings. */
    }
  }
  return current;
}
