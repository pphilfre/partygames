const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const base = process.env.PREVIEW_URL || "http://127.0.0.1:5173";

async function state(page) {
  return page.evaluate(async () => {
    const { useNight } = await import("/src/session/store.ts");
    return JSON.parse(
      JSON.stringify({
        night: useNight.getState().night,
        demo: useNight.getState().demo,
      }),
    );
  });
}
async function act(page, action, ...args) {
  await page.waitForFunction(async () => {
    const { useLiveStatus } = await import("/src/session/live.ts");
    return !useLiveStatus.getState().pending;
  });
  return page.evaluate(
    async ({ action, args }) => {
      const { useNight } = await import("/src/session/store.ts");
      return useNight.getState()[action](...args);
    },
    { action, args },
  );
}
async function until(check, message, timeout = 12000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await check()) return;
    await new Promise((r) => setTimeout(r, 150));
  }
  throw Error(message);
}
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const errors = [],
    contexts = [];
  const newPage = async (mobile = false) => {
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    contexts.push(context);
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    return page;
  };
  try {
    const host = await newPage();
    await host.goto(`${base}/setup`);
    await host.getByRole("button", { name: /Quick tour/ }).click();
    await host.getByRole("button", { name: "Open lobby", exact: true }).click();
    await host.waitForURL(/\/room\?room=\d+&role=host/);
    await host.getByText("Connect your phones.", { exact: true }).waitFor();
    const code = new URL(host.url()).searchParams.get("room");
    console.log("Created real Convex room", code);
    assert.equal(
      (await state(host)).night.players.length,
      0,
      "Live rooms must not include demo players",
    );
    const qr = host.locator(".n-lobby-qr svg");
    assert.equal(await qr.count(), 1);
    const joinAddress = await host
      .locator(".n-live-address > a")
      .getAttribute("href");
    assert.equal(new URL(joinAddress).pathname, "/join");
    assert.equal(new URL(joinAddress).searchParams.get("room"), code);
    assert(
      !/localhost|127\.0\.0\.1|169\.254/.test(joinAddress),
      "QR must use a phone-reachable address",
    );

    const phones = [];
    for (let i = 0; i < 4; i++) {
      const phone = await newPage(true);
      await phone.goto(joinAddress);
      await phone
        .getByRole("textbox", { name: "Your name" })
        .fill(`Phone ${i + 1}`);
      await phone
        .getByRole("button", { name: "Join room", exact: true })
        .click();
      await phone
        .getByText("You’re in. Waiting for the host.", { exact: true })
        .waitFor();
      phones.push(phone);
    }
    await until(
      async () => (await state(host)).night.players.length === 4,
      "Host did not receive roster",
    );
    await phones[0].reload();
    await phones[0]
      .getByText("You’re in. Waiting for the host.", { exact: true })
      .waitFor();
    assert.equal(
      (await state(host)).night.players.length,
      4,
      "Reload must reuse the seat",
    );
    const display = await newPage();
    const displayPath = await host
      .getByRole("link", { name: "Open TV display" })
      .getAttribute("href");
    await display.goto(`${base}${displayPath}`);
    await display
      .getByText("Scan with your phone camera to join.", { exact: true })
      .waitFor();
    assert.equal(
      await display.getByRole("button", { name: "Start night" }).count(),
      0,
    );
    await host.screenshot({
      path: "screenshots/live-lobby.png",
      fullPage: true,
    });
    await phones[0].screenshot({
      path: "screenshots/live-phone-lobby.png",
      fullPage: true,
    });
    await host
      .getByRole("button", { name: "Start night", exact: true })
      .click();

    for (const game of ["ballpark", "bluff", "who"]) {
      await host
        .getByRole("button", { name: "Start game", exact: true })
        .waitFor();
      await host
        .getByRole("button", { name: "Start game", exact: true })
        .click();
      await until(
        async () => (await state(host)).night?.round?.phase === "writing",
        "Countdown did not advance on server",
      );
      const initial = (await state(host)).night;
      assert.equal(initial.round.game, game);
      assert.equal(
        initial.round.question.answer,
        "",
        "Host must not receive truth before reveal",
      );
      for (let i = 0; i < phones.length; i++) {
        await until(
          async () =>
            (await state(phones[i])).night?.round?.phase === "writing",
          "Phone did not update",
        );
        const ps = await state(phones[i]);
        const writer =
          game !== "bluff" ||
          ps.night.round.bluffers.includes(ps.demo.controlled);
        if (writer) {
          const input = phones[i]
            .locator(".n-player input, .n-player textarea")
            .first();
          await input.fill(
            game === "ballpark" ? String(80 + i) : `My private answer ${i}`,
          );
          const buttons = phones[i].locator(
            ".n-player form button[type=submit]",
          );
          if (await buttons.count()) await buttons.first().click();
          else
            await act(
              phones[i],
              "send",
              game === "ballpark" ? String(80 + i) : `My private answer ${i}`,
            );
          await until(
            async () =>
              !!(await state(phones[i])).night.round.answers[
                ps.demo.controlled
              ],
            "Answer was not accepted",
          );
          const another = await state(phones[(i + 1) % 4]);
          assert(
            !JSON.stringify(another.night.round.answers).includes(
              `My private answer ${i}`,
            ),
            "Another phone received a private answer",
          );
        }
      }
      await until(
        async () =>
          (await state(host)).night.round.liveCompletion.received ===
          (game === "bluff" ? 3 : 4),
        "Host completion did not update",
      );
      await act(host, "next");
      if (game !== "ballpark") {
        await until(
          async () => (await state(host)).night.round.phase === "voting",
          "Voting did not start",
        );
        for (const phone of phones) {
          await until(
            async () => (await state(phone)).night.round.phase === "voting",
            "Phone did not receive voting",
          );
          const ps = await state(phone),
            id = ps.demo.controlled,
            r = ps.night.round;
          const writer =
            game === "bluff" ? r.bluffers.includes(id) : r.author === id;
          if (writer) continue;
          assert(
            !JSON.stringify(r.options).includes('"truth"'),
            "Truth identity leaked",
          );
          const value =
            game === "bluff"
              ? "choice-0"
              : ps.night.players.find((p) => p.id !== id).id;
          await act(phone, "send", value);
          await until(
            async () => !!(await state(phone)).night.round.votes[id],
            "Vote was not accepted",
          );
        }
        await act(host, "next");
      }
      await until(
        async () => (await state(host)).night.round.phase === "reveal",
        "Reveal did not start",
      );
      await until(
        async () => (await state(host)).night.round.revealReady,
        "Server reveal did not complete",
      );
      const result = (await state(host)).night;
      assert.equal(result.ledger.length, result.segment + 1);
      await act(host, "next");
      await until(
        async () => (await state(host)).night.round.phase === "standings",
        "Standings did not show",
      );
      await act(host, "next");
      await until(
        async () =>
          ["transition", "finale"].includes((await state(host)).night.status),
        "Round did not complete",
      );
      console.log(
        "Completed",
        game,
        "across host, TV and four isolated phones",
      );
    }
    assert.equal((await state(host)).night.status, "finale");
    await phones[0].screenshot({
      path: "screenshots/live-phone-finale.png",
      fullPage: true,
    });
    await host.screenshot({
      path: "screenshots/live-finale.png",
      fullPage: true,
    });
    for (const page of [host, ...phones]) {
      const overflow = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        elements: [...document.querySelectorAll("body *")]
          .filter(
            (e) =>
              e.getBoundingClientRect().right > innerWidth + 1 ||
              e.getBoundingClientRect().left < -1,
          )
          .slice(0, 8)
          .map((e) => ({
            class: e.className?.baseVal || e.className,
            left: e.getBoundingClientRect().left,
            right: e.getBoundingClientRect().right,
          })),
      }));
      assert(
        overflow.scroll <= overflow.width + 1,
        `Horizontal overflow: ${JSON.stringify(overflow)}`,
      );
    }
    assert.deepEqual(errors, [], "Browser runtime errors");
    await act(host, "rematch");
    await until(
      async () => (await state(host)).night.status === "lobby",
      "Rematch failed",
    );
    assert.equal((await state(host)).night.players.length, 4);
    await act(host, "finish");
    console.log(
      "PASS: QR target, joins, roster, reload, TV permissions, all games, scoring, rematch, browser errors and overflow",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
