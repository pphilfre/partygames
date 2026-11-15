const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { default: AxeBuilder } = require("@axe-core/playwright");
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
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const state = () =>
    page.evaluate(async () => {
      const { useNight } = await import(
        performance
          .getEntriesByType("resource")
          .find((e) => new URL(e.name).pathname === "/src/session/store.ts")
          .name
      );
      return JSON.parse(JSON.stringify(useNight.getState()));
    });
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
  const ticks = async (n = 12) => {
    for (let i = 0; i < n; i++) await run("tick");
  };
  const overflow = async (label) => {
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `Horizontal overflow: ${label}`,
    );
  };
  const axe = async (label) => {
    const report = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    if (report.violations.length) {
      console.log(
        "AXE",
        label,
        JSON.stringify(
          report.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          })),
          null,
          2,
        ),
      );
    }
    return report.violations.map((v) => ({
      label,
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    }));
  };
  const a11y = [];
  await page.goto(base);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page
    .getByRole("link", { name: "Host a game night", exact: true })
    .click();
  await page.getByRole("button", { name: "Quick tour", exact: false }).click();
  await page.getByRole("checkbox", { name: "Demo mode", exact: true }).check();
  await page.getByRole("button", { name: "Open lobby", exact: true }).click();
  assert.equal((await state()).night.players.length, 14);
  await page.getByRole("button", { name: "Edit Alex", exact: true }).click();
  await page.getByLabel("Display name").fill("Freddie");
  await page.getByRole("button", { name: "Curls", exact: true }).click();
  await page
    .getByRole("button", { name: "Save avatar", exact: false })
    .click();
  await page.getByRole("button", { name: "Start night", exact: true }).click();
  await page
    .getByRole("button", { name: "Start practice", exact: true })
    .click();
  await ticks();
  await page.locator("input[name=estimate]").fill("3");
  await page
    .getByRole("button", { name: "Lock estimate", exact: true })
    .click();
  await run("fill");
  await page
    .getByRole("button", { name: "Reveal estimates", exact: true })
    .click();
  assert.equal((await state()).night.ledger.length, 0);
  await page
    .getByRole("button", { name: "Show result now", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show standings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start scored rounds", exact: true })
    .click();
  await ticks();
  await page.locator("input[name=estimate]").fill("86");
  await page
    .getByRole("button", { name: "Lock estimate", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Update estimate", exact: true })
    .click();
  await page.locator("input[name=estimate]").fill("88");
  await page
    .getByRole("button", { name: "Update estimate", exact: true })
    .click();
  await run("fill");
  assert.equal((await state()).night.round.answers.p0.value, "88");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const before = JSON.stringify((await state()).night.round);
  await ticks(40);
  assert.equal(JSON.stringify((await state()).night.round), before);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page
    .getByRole("button", { name: "Reveal estimates", exact: true })
    .click();
  assert.equal((await state()).night.ledger.length, 1);
  assert.equal(await page.locator(".n-personal-result").count(), 0);
  await page
    .getByRole("button", { name: "Show result now", exact: true })
    .click();
  await page.locator(".n-personal-result").waitFor();
  a11y.push(...(await axe("Ballpark result")));
  await page
    .getByRole("button", { name: "Show standings", exact: true })
    .click();
  await page.getByRole("button", { name: "Next game", exact: true }).click();
  assert.equal((await state()).night.stamps.length, 1);
  await page
    .getByRole("button", {
      name: "Start game",
      exact: true,
    })
    .click();
  await ticks();
  let st = await state();
  if (st.night.round.bluffers.includes("p0")) {
    await page
      .locator("textarea[name=answer]")
      .fill("A very distinguished hamster");
    await page.getByRole("button", { name: "Send bluff", exact: true }).click();
  }
  await run("fill");
  await page.getByRole("button", { name: "Start voting", exact: true }).click();
  st = await state();
  if (!st.night.round.bluffers.includes("p0")) {
    await page.locator(".n-phone-choices button").first().click();
    await page
      .getByRole("button", { name: "Lock choice", exact: true })
      .click();
  }
  await run("fill");
  await page
    .getByRole("button", { name: "Reveal answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show result now", exact: true })
    .click();
  a11y.push(...(await axe("Bluff result")));
  await page
    .getByRole("button", { name: "Show standings", exact: true })
    .click();
  await page.getByRole("button", { name: "Next game", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Start game",
      exact: true,
    })
    .click();
  await ticks();
  st = await state();
  if (st.night.round.game === "who") {
    await page
      .locator("textarea[name=answer]")
      .fill("I can juggle while standing on one leg.");
    await page
      .getByRole("button", { name: "Send answer", exact: true })
      .click();
  }
  await run("fill");
  await page
    .getByRole("button", { name: "Start guessing", exact: true })
    .click();
  st = await state();
  if (st.night.round.author !== "p0") {
    await page.locator(".n-candidate-grid button").first().click();
    await page.getByRole("button", { name: "Lock guess", exact: true }).click();
  }
  await run("fill");
  await page
    .getByRole("button", { name: "Reveal author", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show result now", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show standings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Tonight’s finale", exact: true })
    .click();
  st = await state();
  assert.equal(st.night.status, "finale");
  assert.equal(st.night.ledger.length, 3);
  assert.equal(st.night.stamps.length, 3);
  a11y.push(...(await axe("Finale")));
  await page.screenshot({
    path: "screenshots/night-finale-desktop.png",
    fullPage: true,
  });
  console.log(
    "PASS complete quick tour, practice, estimates, pause, all games, atomic results, finale",
  );
  await run("scenario", "Be the secret author");
  await run("send", "A secret only the author knows");
  await page.getByRole("button", { name: "Host", exact: true }).click();
  assert(
    !(await page.locator(".n-host-room").innerText()).includes(
      "A secret only the author knows",
    ),
  );
  await page.getByRole("button", { name: "Together", exact: true }).click();
  await page.getByLabel("Preview a player").selectOption("p2");
  assert.equal((await state()).demo.controlled, "p0");
  await page.getByRole("button", { name: "Take control", exact: true }).click();
  assert.equal((await state()).demo.controlled, "p2");
  await page.reload();
  assert.equal((await state()).needsResume, true);
  assert.equal(
    (await state()).night.round.answers.p0.value,
    "A secret only the author knows",
  );
  await page.getByRole("button", { name: "Resume demo", exact: true }).click();
  console.log("PASS private host, preview versus control, refresh recovery");
  for (const width of [320, 390, 768, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/setup",
      "/dashboard",
      "/dashboard/games",
      "/dashboard/questions",
      "/dashboard/settings",
      "/lobby",
      "/demo",
      "/display",
      "/play",
      "/leaderboard",
    ]) {
      await page.goto(base + route);
      await overflow(`${route}@${width}`);
    }
    console.log("PASS 11 routes without overflow at", width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/setup",
    "/dashboard/questions",
    "/dashboard/settings",
  ]) {
    await page.goto(base + route);
    a11y.push(...(await axe(route)));
  }
  await page.goto(base + "/demo");
  await run("scenario", "Be the secret author");
  await page.getByRole("button", { name: "Your phone", exact: true }).click();
  a11y.push(...(await axe("Author writing mobile")));
  await page.locator("textarea").fill("Saved draft");
  await page
    .getByRole("button", { name: "Host controls", exact: true })
    .click();
  await page.getByRole("button", { name: "Your phone", exact: true }).click();
  assert.equal(await page.locator("textarea").inputValue(), "Saved draft");
  await page.getByRole("button", { name: "Demo tools", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await run("send", "An accepted secret answer");
  await run("next");
  a11y.push(...(await axe("Author wait mobile")));
  await run("setDemo", { controlled: "p2", preview: "p2" });
  a11y.push(...(await axe("Guess Who candidates mobile")));
  console.log("PASS mobile role tabs, drafts, accessible tools dialog");
  await page.goto(base + "/dashboard/questions");
  await page.getByRole("button", { name: "New question", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  a11y.push(...(await axe("Question editor")));
  await page.keyboard.press("Escape");
  assert.deepEqual(errors, [], "No browser runtime errors");
  fs.writeFileSync(
    "screenshots/night-a11y-report.json",
    JSON.stringify(a11y, null, 2),
  );
  console.log("Accessibility violations:", a11y.length);
  await browser.close();
  if (a11y.length) process.exitCode = 2;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
