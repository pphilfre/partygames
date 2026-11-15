import { describe, expect, it } from "vitest";
import { isLoopbackAddress, resolveJoinBase } from "./urls";

describe("joining on the active domain", () => {
  it.each([
    "https://partygames-puce.vercel.app",
    "https://partygames-new-preview.vercel.app",
    "https://party.example.org",
    "https://www.party.example.org",
  ])(
    "uses %s despite stale local settings or a different configured domain",
    (origin) => {
      expect(
        resolveJoinBase(
          origin,
          "http://192.168.1.64:5174",
          "https://old.example.org",
        ),
      ).toBe(origin);
    },
  );
  it("keeps a direct Wi-Fi origin and port", () => {
    expect(
      resolveJoinBase("http://192.168.1.64:5174", "http://192.168.1.25:5173"),
    ).toBe("http://192.168.1.64:5174");
  });
  it("allows a configured frontend or saved Wi-Fi address from localhost", () => {
    expect(
      resolveJoinBase("http://localhost:5173", "http://192.168.1.64:5173"),
    ).toBe("http://192.168.1.64:5173");
    expect(
      resolveJoinBase(
        "http://127.0.0.1:5173",
        "http://192.168.1.64:5173",
        "https://party.example.org/setup",
      ),
    ).toBe("https://party.example.org");
  });
  it("ignores invalid saved values and unsafe URL schemes", () => {
    expect(
      resolveJoinBase(
        "http://localhost:5173",
        "not a URL",
        "javascript:alert(1)",
      ),
    ).toBe("http://localhost:5173");
  });
  it("recognizes IPv6 and local subdomains without treating public names as local", () => {
    expect(isLoopbackAddress("http://[::1]:5173")).toBe(true);
    expect(isLoopbackAddress("http://party.localhost:5173")).toBe(true);
    expect(isLoopbackAddress("https://localhost.example.org")).toBe(false);
  });
});
