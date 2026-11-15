const { chromium } = require("playwright-core");
const { default: AxeBuilder } = require("@axe-core/playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.PREVIEW_URL || "http://127.0.0.1:5180";
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [],
    violations = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const run = (action, ...args) =>
    page.evaluate(
      async ({ action, args }) => {
        const { useNight } = await import(
          performance
            .getEntriesByType("resource")
            .find((e) => new URL(e.name).pathname === "/src/session/store.ts")
            .name
        );
        return action === "snapshot"
          ? JSON.parse(JSON.stringify(useNight.getState()))
          : useNight.getState()[action](...args);
      },
      { action, args },
    );
  const ticks = async (n) => {
    for (let i = 0; i < n; i++) await run("tick");
  };
  const axe = async (label) => {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    violations.push(
      ...result.violations.map((v) => ({
        label,
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    );
  };
  const shot = async (label) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `screenshots/show-${label}.png`,
      fullPage: true,
    });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `overflow ${label}`,
    );
  };
  await page.goto(base + "/setup");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Quick tour", exact: false }).click();
  await page.getByRole("checkbox", { name: "Demo mode", exact: true }).check();
  await page.getByRole("button", { name: "Open lobby", exact: true }).click();
  await run("setDemo", { auto: false });
  assert(
    await page
      .getByRole("button", { name: "Start night", exact: true })
      .isDisabled(),
  );
  await shot("waiting-desktop");
  await page
    .getByRole("button", { name: "Try joining with the code", exact: true })
    .click();
  await page.getByRole("button", { name: "Lock room", exact: true }).click();
  assert(
    await page
      .getByRole("button", { name: "Join room", exact: true })
      .isDisabled(),
  );
  await page.getByRole("button", { name: "Unlock room", exact: true }).click();
  const pin = (await page.locator(".n-room-code > strong").innerText()).replace(
    /\s/g,
    "",
  );
  await page.getByLabel("Room code", { exact: true }).fill("000000");
  await page.getByLabel("Your name", { exact: true }).fill("Freddie");
  await page.getByRole("button", { name: "Join room", exact: true }).click();
  assert((await run("snapshot")).error.includes("code doesn’t match"));
  await page
    .getByRole("button", { name: "Dismiss message", exact: true })
    .click();
  await shot("join-desktop");
  await page.getByLabel("Room code", { exact: true }).fill(pin);
  await page.getByRole("button", { name: "Join room", exact: true }).click();
  assert(
    (await page.locator(".n-room-waiting").innerText()).includes("Freddie"),
  );
  await run("setDemo", { auto: true });
  await ticks(4);
  assert.equal((await run("snapshot")).night.lobby.joined.length, 2);
  await page
    .getByRole("button", { name: "Fill demo lobby", exact: false })
    .click();
  await shot("lobby-desktop");
  await axe("Lobby desktop");
  for (const width of [320, 390, 768, 1100]) {
    await page.setViewportSize({ width, height: 844 });
    await shot(`lobby-${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await axe("Lobby mobile");
  await page.getByRole("button", { name: "Your phone", exact: true }).click();
  await page
    .getByRole("button", { name: "Try joining with the code", exact: true })
    .click();
  await shot("join-mobile");
  await axe("Join mobile");
  await page.getByLabel("Room code", { exact: true }).fill(pin);
  await page.getByRole("button", { name: "Join room", exact: true }).click();
  await page.reload();
  assert(
    (await page.locator(".n-room-waiting").innerText()).includes("Freddie"),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Start night", exact: true }).click();
  for (const game of ["ballpark", "bluff", "who"]) {
    await shot(`${game}-intro`);
    await page
      .getByRole("button", {
        name: "Start game",
        exact: true,
      })
      .click();
    await shot(`${game}-countdown`);
    await ticks(12);
    await run("setDemo", { auto: false });
    await shot(`${game}-writing`);
    await axe(`${game} writing`);
    let state = await run("snapshot");
    if (game === "ballpark") await run("send", "86");
    else if (
      game === "bluff" &&
      state.night.round.bluffers.includes(state.demo.controlled)
    )
      await run("send", "A highly suspicious hamster");
    else if (
      game === "who"
    )
      await run("send", "A suitcase full of snacks");
    await run("fill");
    if (game !== "ballpark") {
      await run("next");
      // Show a guesser’s private choices, preserving manual control ownership.
      state = await run("snapshot");
      const guesser = state.night.round.participants.find((id) =>
        game === "who"
          ? id !== state.night.round.author
          : !state.night.round.bluffers.includes(id),
      );
      await run("setDemo", { controlled: guesser, preview: guesser });
      await shot(`${game}-voting`);
      await axe(`${game} voting`);
      if (game === "bluff") {
        await page.setViewportSize({ width: 390, height: 844 });
        await page
          .getByRole("button", { name: "Your phone", exact: true })
          .click();
        await shot("bluff-phone-mobile");
        await axe("Bluff phone mobile");
        await page.setViewportSize({ width: 1440, height: 1000 });
      }
      const choice = game === "bluff" ? "choice-0" : state.night.round.author;
      await run("send", choice);
      await run("fill");
    }
    await run("next");
    await ticks(8);
    state = await run("snapshot");
    assert.equal(state.night.round.revealReady, false);
    assert.equal(await page.locator(".n-public-result").count(), 0);
    await shot(`${game}-suspense`);
    await ticks(12);
    assert.equal((await run("snapshot")).night.round.revealReady, true);
    await shot(`${game}-reveal`);
    await axe(`${game} reveal`);
    await run("next");
    await shot(`${game}-standings`);
    await run("next");
  }
  assert.equal((await run("snapshot")).night.status, "finale");
  await shot("finale");
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "screenshots/show-a11y-report.json",
    JSON.stringify(violations, null, 2),
  );
  if (violations.length) console.log(JSON.stringify(violations, null, 2));
  assert.equal(violations.length, 0, "Accessibility violations");
  console.log(
    "PASS lobby arrivals, minimum, code entry, lock/unlock, persistence, all game screens, staged reveals, responsive layouts, zero axe violations",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
