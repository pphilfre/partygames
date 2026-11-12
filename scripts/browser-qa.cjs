const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const shot = async (name) => {
    await page.waitForTimeout(1400);
    await page.screenshot({
      path: require("node:path").resolve(`screenshots/${name}.png`),
      fullPage: true,
    });
  };
  const state = () =>
    page.evaluate(
      () => JSON.parse(localStorage.getItem("afterparty-v1")).state,
    );
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Launch Demo", exact: true }).click();
  assert.equal((await state()).players.length, 14);
  await page.getByRole("button", { name: "Create 14-player party" }).click();
  for (const game of ["bluff", "who", "ballpark"]) {
    await page.locator('select[aria-label="Choose game"]').selectOption(game);
    await page.getByRole("button", { name: "Start game", exact: true }).click();
    await page
      .getByRole("button", { name: "Advance phase", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Advance phase", exact: true })
      .click();
    assert.equal((await state()).round.phase, "writing");
    if (game === "ballpark") {
      await page.locator(".phone-frame input[name=estimate]").fill("88");
      await page.getByRole("button", { name: "Submit", exact: true }).click();
      assert.equal((await state()).round.answers.p0.value, "88");
      await shot("05-mobile-estimate-split");
    }
    await page
      .getByRole("button", { name: "Simulate answers", exact: true })
      .click();
    assert.equal(
      Object.keys((await state()).round.answers).length,
      game === "bluff" ? 3 : game === "who" ? 1 : 14,
    );
    await page
      .getByRole("button", { name: "Advance phase", exact: true })
      .click();
    if (game !== "ballpark") {
      await page
        .getByRole("button", { name: "Simulate votes", exact: true })
        .click();
      assert.equal(
        Object.keys((await state()).round.votes).length,
        game === "bluff" ? 11 : 13,
      );
      await page
        .getByRole("button", { name: "Reveal answers", exact: true })
        .click();
    }
    assert.equal((await state()).round.phase, "reveal");
    await page.getByRole("button", { name: "TV", exact: true }).click();
    await shot(
      game === "bluff"
        ? "02-bluff-reveal"
        : game === "who"
          ? "03-guess-who-reveal"
          : "04-ballpark-reveal",
    );
    await page
      .getByRole("button", { name: "Award points", exact: true })
      .click();
    assert.equal((await state()).round.phase, "standings");
    assert((await state()).players.some((p) => p.score > 0));
    await page
      .getByRole("button", { name: "Complete game & podium", exact: true })
      .click();
    assert.equal((await state()).round.phase, "complete");
    await page.getByRole("button", { name: "Split", exact: true }).click();
  }
  await page.getByRole("button", { name: "TV", exact: true }).click();
  await shot("06-podium");
  const before = (await state()).players.map((p) => p.score);
  await page.reload();
  assert.deepEqual(
    (await state()).players.map((p) => p.score),
    before,
  );
  await page.goto("http://localhost:5173/dashboard/questions");
  await page.getByRole("button", { name: "New question", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Question", { exact: true })
    .fill("What is the best party snack?");
  await dialog.getByLabel("Correct answer", { exact: true }).fill("Crisps");
  await dialog.getByRole("button", { name: "Save question" }).click();
  await page
    .getByRole("button", { name: "What is the best party snack?", exact: true })
    .waitFor();
  assert(
    (await state()).questions.some(
      (q) => q.text === "What is the best party snack?",
    ),
  );
  await shot("07-question-library");
  for (const route of [
    "/dashboard",
    "/dashboard/games",
    "/dashboard/questions",
    "/dashboard/settings",
    "/lobby",
    "/display",
    "/play",
    "/leaderboard",
    "/demo",
  ]) {
    await page.goto("http://localhost:5173" + route);
    await page.locator("main").first().waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      route + " desktop overflow",
    );
  }
  await page.goto("http://localhost:5173/dashboard");
  await shot("01-host-dashboard");
  await page.goto("http://localhost:5173/");
  await shot("00-home");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/dashboard",
    "/demo",
    "/dashboard/questions",
    "/play",
  ]) {
    await page.goto("http://localhost:5173" + route);
    await page.waitForTimeout(300);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      route + " mobile overflow",
    );
  }
  await page.evaluate(async () => {
    const { useParty } = await import("/src/store.ts");
    const s = () => useParty.getState();
    s().start("who");
    s().next();
    s().next();
    s().sim();
    s().next();
    s().setActive("p3");
  });
  await page.goto("http://localhost:5173/play");
  await shot("08-mobile-guess-who");
  await page.locator(".mobile-roster button").first().click();
  await page.waitForTimeout(200);
  assert((await state()).round.votes.p3);
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    "Browser QA passed: all routes, all 3 games with 14 players, mobile submissions, real scores, persistence, custom question creation, desktop/mobile overflow.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
