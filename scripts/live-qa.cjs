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
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://localhost:5173/demo");
  await page.getByRole("button", { name: "Start game", exact: true }).waitFor();
  await page.evaluate(async () => {
    const { useParty } = await import("/src/store.ts");
    const s = () => useParty.getState();
    s().init(24);
    s().configure({ rounds: 3 });
    s().start("ballpark");
    s().next();
    s().next();
    s().sim();
    s().editSubmission("p0", "88");
    s().next();
    s().next();
    s().next();
    if (s().round.phase !== "writing")
      throw Error("Next round must start writing directly");
    s().sim();
    s().editSubmission("p0", s().round.question.answer);
    s().next();
  });
  await page.goto("http://localhost:5173/display");
  assert.equal(await page.locator(".tv-footer").count(), 0);
  await page.locator(".cinematic-line").waitFor();
  assert.equal(await page.locator(".cinematic-answer").count(), 0);
  await page.waitForTimeout(28500);
  await page.locator(".cinematic-answer").waitFor();
  assert.equal(await page.locator(".estimate-grid").count(), 0);
  await page.screenshot({
    path: "screenshots/12-clean-ballpark.png",
    fullPage: true,
  });
  await page.evaluate(async () => {
    const { useParty } = await import("/src/store.ts");
    useParty.getState().next();
  });
  await page.waitForTimeout(1800);
  const rows = await page.locator(".live-rankings .rank-row").count();
  assert(rows <= 8);
  const bounds = await page.locator(".live-rankings").boundingBox();
  assert(bounds.y + bounds.height <= 900);
  await page.screenshot({ path: "screenshots/13-clean-leaderboard.png" });
  const state = await page.evaluate(
    () => JSON.parse(localStorage.getItem("afterparty-v1")).state,
  );
  assert.equal(state.players[0].streak, 2);
  assert.equal(state.round.bonuses.p0, 100);
  assert.equal(state.round.points.p0, 1100);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:5173/play");
  await page.locator(".phone-result").waitFor();
  await page.waitForTimeout(1500);
  assert.equal(await page.locator(".mobile-footer").count(), 0);
  assert.equal(await page.locator(".mobile-header").count(), 0);
  assert.equal(await page.locator(".phone-streak").count(), 1);
  await page.screenshot({
    path: "screenshots/14-phone-streak.png",
    fullPage: true,
  });
  await page.evaluate(async () => {
    const { useParty } = await import("/src/store.ts");
    const s = () => useParty.getState();
    s().init(14);
    s().start("who");
    s().next();
    s().next();
    s().sim();
    s().next();
    s().setActive("p3");
  });
  await page.goto("http://localhost:5173/display");
  assert.equal(await page.locator(".suspect-cloud").count(), 0);
  await page.locator(".anonymous-answer").waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:5173/play");
  await page.locator(".mobile-roster").waitFor();
  await page.screenshot({
    path: "screenshots/15-clean-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  await browser.close();
  console.log(
    "Live UX QA passed: 24-player fit, staged reveal, direct round progression, streak scoring and mobile results.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
