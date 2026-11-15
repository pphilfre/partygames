const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const base = process.env.PREVIEW_URL || "http://127.0.0.1:5173";
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : process.platform === "win32"
        ? {
            executablePath:
              "C:/Program Files/Google/Chrome/Application/chrome.exe",
          }
        : {}),
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(8000);
  const run = (action, ...args) =>
    page.evaluate(
      async ({ action, args }) => {
        const { useNight } = await import(
          performance
            .getEntriesByType("resource")
            .find((e) => new URL(e.name).pathname === "/src/session/store.ts")
            .name
        );
        return useNight.getState()[action](...args);
      },
      { action, args },
    );
  const ticks = async (n) => {
    for (let i = 0; i < n; i++) await run("tick");
  };
  const shot = async (name) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `screenshots/night-${name}.png`,
      fullPage: true,
    });
  };
  if (process.argv.includes("--player-only")) {
    await page.goto(base);
    await run("scenario", "First night");
    await page.goto(base + "/demo");
    await run("startNight");
    await run("begin", false);
    await ticks(12);
    await run("send", "86");
    await run("fill");
    await run("next");
    await run("next");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Your phone", exact: true }).click();
    await shot("player-mobile");
    await browser.close();
    return;
  }
  await page.goto(base);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await shot("home-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("home-mobile");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page
    .getByRole("link", { name: "Host a game night", exact: true })
    .click();
  await shot("setup-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("setup-mobile");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("checkbox", { name: "Demo mode", exact: true }).check();
  await page.getByRole("button", { name: "Open lobby", exact: true }).click();
  await shot("lobby-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("lobby-mobile");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Start night", exact: true }).click();
  await shot("intro-desktop");
  await page
    .getByRole("button", {
      name: "Start game",
      exact: true,
    })
    .click();
  await ticks(12);
  await page.locator("input[name=estimate]").fill("86");
  await page
    .getByRole("button", { name: "Lock estimate", exact: true })
    .click();
  await ticks(38);
  await shot("together-desktop");
  assert.equal(
    Math.round(
      await page
        .locator(".n-phone-column")
        .evaluate((el) => el.getBoundingClientRect().width),
    ),
    340,
  );
  await page.getByRole("button", { name: "Host", exact: true }).click();
  await shot("host-desktop");
  await page.getByRole("button", { name: "Together", exact: true }).click();
  await page
    .getByRole("button", { name: "Reveal estimates", exact: true })
    .click();
  await ticks(20);
  await shot("reveal-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Your phone", exact: true }).click();
  await shot("player-mobile");
  await page
    .getByRole("button", { name: "Host controls", exact: true })
    .click();
  await shot("host-mobile");
  await page.setViewportSize({ width: 1440, height: 900 });
  await run("scenario", "Be the secret author");
  await run(
    "send",
    "I make an excellent pancake. The first one is always a disaster.",
  );
  await run("next");
  await shot("guess-who-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Your phone", exact: true }).click();
  await run("setDemo", { preview: "p2", controlled: "p2" });
  await shot("guess-who-mobile");
  await page.getByRole("button", { name: "Demo tools", exact: true }).click();
  await shot("tools-mobile");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1280, height: 720 });
  await run("scenario", "Big party");
  await run("startNight");
  await run("begin", false);
  await ticks(12);
  await run("setDemo", { controlled: "outside" });
  await run("fill");
  await run("next");
  await run("next");
  await run("next");
  await page.goto(base + "/display");
  await run("resume");
  await shot("standings-24-tv");
  assert(
    await page
      .locator(".n-live-ranks")
      .last()
      .evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight),
    "All 24 positions fit the 720px TV viewport",
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + "/demo");
  await run("scenario", "Quick tour");
  await run("startNight");
  for (let g = 0; g < 3; g++) {
    await run("begin", false);
    await ticks(12);
    await run("setDemo", { controlled: "outside" });
    await run("fill");
    if (g > 0) {
      await run("next");
      await run("fill");
    }
    await run("next");
    await run("next");
    await run("next");
    await run("next");
  }
  await run("setDemo", { controlled: "p0", preview: "p0" });
  await shot("finale-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("finale-mobile");
  await page.goto(base + "/dashboard/questions");
  await shot("questions-mobile");
  await page.goto(base + "/dashboard/settings");
  await shot("settings-mobile");
  console.log("PASS final screenshot batch and 24-player 1280×720 TV fit");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
