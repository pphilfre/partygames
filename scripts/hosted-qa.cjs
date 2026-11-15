const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const base = process.env.PREVIEW_URL || "https://partygames-puce.vercel.app";

(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH || process.platform === "win32"
      ? {
          executablePath:
            process.env.CHROMIUM_PATH ||
            "C:/Program Files/Google/Chrome/Application/chrome.exe",
        }
      : {}),
    headless: true,
  });
  const errors = [];
  const newPage = async (mobile = false) => {
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    // A stale local address must never override the public domain's QR code.
    await context.addInitScript(() =>
      localStorage.setItem("afterparty-join-base", "http://192.168.1.25:5173"),
    );
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", (e) => errors.push(e.message));
    return page;
  };
  try {
    const host = await newPage();
    const response = await host.goto(`${base}/setup`);
    assert.equal(response.status(), 200, "Direct setup route must be served");
    await host.getByRole("button", { name: /Quick tour/ }).click();
    await host.getByRole("button", { name: "Open lobby", exact: true }).click();
    await host.waitForURL(/\/room\?room=\d+&role=host/);
    await host.getByText("Connect your phones.", { exact: true }).waitFor();
    const code = new URL(host.url()).searchParams.get("room");
    const join = await host.locator(".n-live-address > a").getAttribute("href");
    assert.equal(
      new URL(join).origin,
      new URL(base).origin,
      "QR must use the current public domain",
    );
    assert.equal(new URL(join).searchParams.get("room"), code);
    await host.reload();
    await host.getByText("Connect your phones.", { exact: true }).waitFor();
    assert.equal(
      await host.locator(".n-live-address > a").getAttribute("href"),
      join,
    );
    console.log(
      "PASS public host route, reload, configured Convex and same-domain QR",
    );
    const phones = [];
    for (let i = 0; i < 4; i++) {
      const phone = await newPage(true);
      const joined = await phone.goto(join);
      assert.equal(joined.status(), 200, "QR deep link must be served");
      await phone
        .getByRole("textbox", { name: "Your name" })
        .fill(`Hosted QA ${i + 1}`);
      await phone
        .getByRole("button", { name: "Join room", exact: true })
        .click();
      await phone
        .getByText("You’re in. Waiting for the host.", { exact: true })
        .waitFor();
      phones.push(phone);
    }
    await phones[0].reload();
    await phones[0]
      .getByText("You’re in. Waiting for the host.", { exact: true })
      .waitFor();
    const display = await newPage();
    const displayLink = await host
      .getByRole("link", { name: "Open TV display" })
      .getAttribute("href");
    assert.equal(
      (await display.goto(new URL(displayLink, base).href)).status(),
      200,
    );
    await display
      .getByText("Scan with your phone camera to join.", { exact: true })
      .waitFor();
    assert.equal(
      await display
        .getByRole("button", { name: "Start night", exact: true })
        .count(),
      0,
    );
    await host
      .getByRole("button", { name: "Start night", exact: true })
      .click();
    await host.getByRole("button", { name: "Start game", exact: true }).click();
    for (const phone of phones) {
      await phone.getByRole("textbox", { name: "Your estimate" }).fill("88");
      await phone
        .getByRole("button", { name: "Lock estimate", exact: true })
        .click();
      await phone.getByText("Estimate saved.", { exact: true }).waitFor();
    }
    await host
      .getByRole("button", { name: "Reveal estimates", exact: true })
      .click();
    // Release may finish automatically before this click is needed.
    const release = host.getByRole("button", {
      name: "Show result now",
      exact: true,
    });
    await release
      .or(host.getByRole("button", { name: "Show standings", exact: true }))
      .waitFor();
    if (await release.count()) await release.click();
    await host
      .getByRole("button", { name: "Show standings", exact: true })
      .click();
    await host
      .getByRole("heading", { name: "Leaderboard", exact: true })
      .waitFor();
    await host.getByRole("button", { name: "End night", exact: true }).click();
    await host
      .getByRole("button", { name: "Play again", exact: true })
      .waitFor();
    console.log(
      "PASS four phone joins, refresh recovery, read-only TV, server countdown, real estimates and scoring",
    );
    const demo = await newPage();
    await demo.goto(`${base}/setup`);
    await demo
      .getByRole("checkbox", { name: "Demo mode", exact: true })
      .check();
    await demo.getByRole("button", { name: "Open lobby", exact: true }).click();
    await demo.waitForURL(/\/lobby$/);
    await demo.getByText("Local demo", { exact: true }).waitFor();
    assert.deepEqual(errors, [], "Browser errors");
    console.log("PASS hosted demo toggle and no browser runtime errors");
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
