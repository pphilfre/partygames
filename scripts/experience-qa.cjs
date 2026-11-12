const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.addInitScript(() => {
    window.pulses = [];
    navigator.vibrate = (pattern) => {
      window.pulses.push(pattern);
      return true;
    };
  });
  const routes = [
    "/",
    "/dashboard",
    "/dashboard/games",
    "/dashboard/questions",
    "/dashboard/settings",
    "/lobby",
    "/leaderboard",
    "/demo",
    "/play",
    "/display",
  ];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto("http://localhost:5173" + route);
      await page.locator("main").waitFor();
      await page.waitForTimeout(280);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      assert.equal(overflow, false, `${width}px ${route} overflow`);
      if (width <= 390 && !["/", "/play", "/display"].includes(route))
        assert(
          await page
            .getByRole("navigation", { name: "Main navigation" })
            .isVisible(),
        );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:5173/dashboard");
  assert.equal(
    await page.getByRole("progressbar").getAttribute("aria-valuenow"),
    "1",
  );
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "You" })
    .click();
  await page.getByLabel("Reduced motion").check();
  assert.equal(
    await page.locator("html").getAttribute("data-reduced-motion"),
    "true",
  );
  await page.reload();
  assert(await page.getByLabel("Reduced motion").isChecked());
  await page.getByLabel("Haptic feedback").uncheck();
  await page.evaluate(() => (window.pulses = []));
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Home" })
    .click();
  assert.equal(await page.evaluate(() => window.pulses.length), 0);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "You" })
    .click();
  await page.getByLabel("Haptic feedback").check();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Home" })
    .click();
  assert((await page.evaluate(() => window.pulses.length)) > 0);
  await page.evaluate(async () => {
    const { useParty } = await import("/src/store.ts");
    const s = () => useParty.getState();
    s().start("ballpark");
    s().next();
    s().next();
    s().sim();
    s().next();
    s().next();
  });
  assert.equal(
    await page.getByRole("progressbar").getAttribute("aria-valuenow"),
    "2",
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  await browser.close();
  console.log(
    "Experience QA passed: 40 responsive route checks, mobile navigation, real journey progress, persisted reduced motion, optional haptics.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
