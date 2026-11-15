import { afterEach, expect, it, vi } from "vitest";

function audioHarness() {
  const buses: { disconnect: ReturnType<typeof vi.fn> }[] = [];
  const oscillatorStarts = vi.fn();
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  });
  class AudioMock {
    currentTime = 0;
    destination = {};
    resume = vi.fn();
    createGain() {
      const node = { gain: param(), connect: vi.fn(), disconnect: vi.fn() };
      buses.push(node);
      return node;
    }
    createOscillator() {
      return {
        type: "sine",
        frequency: param(),
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: oscillatorStarts,
        stop: vi.fn(),
        onended: null,
      };
    }
  }
  vi.stubGlobal("AudioContext", AudioMock);
  return { buses, oscillatorStarts };
}
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("waits for a user gesture, loops one music transport, and stops it on mute", async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const { buses, oscillatorStarts } = audioHarness();
  const { setMusic, unlockAudio } = await import("./sound");
  setMusic("lobby");
  expect(oscillatorStarts).not.toHaveBeenCalled();
  unlockAudio();
  expect(oscillatorStarts).toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(1);
  setMusic("lobby");
  expect(vi.getTimerCount()).toBe(1);
  setMusic("");
  expect(vi.getTimerCount()).toBe(0);
  expect(buses[0].disconnect).toHaveBeenCalledOnce();
});

it("disconnects the previous score when the game phase changes", async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const { buses } = audioHarness();
  const { setMusic, unlockAudio } = await import("./sound");
  unlockAudio();
  setMusic("play");
  const previous = buses[0];
  setMusic("reveal");
  expect(previous.disconnect).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(1);
  setMusic("");
});
