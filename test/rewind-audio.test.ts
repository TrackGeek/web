import { afterEach, describe, expect, test } from "bun:test";
import { REWIND_AUDIO_PROFILES } from "../src/constants/rewind-audio";
import { createRewindAudio } from "../src/utils/create-rewind-audio";

class AudioParameter {
  value = 0;
  targets: number[] = [];
  setValueAtTime(value: number) {
    this.value = value;
  }
  linearRampToValueAtTime(value: number) {
    this.value = value;
  }
  exponentialRampToValueAtTime(value: number) {
    this.value = value;
  }
  setTargetAtTime(value: number) {
    this.targets.push(value);
    this.value = value;
  }
}

class AudioNode {
  type = "sine";
  gain = new AudioParameter();
  frequency = new AudioParameter();
  onended: (() => void) | null = null;
  stops: number[] = [];
  disconnected = false;
  connect() {}
  disconnect() {
    this.disconnected = true;
  }
  start() {}
  stop(at = 10) {
    this.stops.push(at);
    if (at <= 10) this.onended?.();
  }
}

class AudioContextFixture {
  static last: AudioContextFixture;
  constructor() {
    AudioContextFixture.last = this;
  }
  currentTime = 10;
  state = "suspended";
  destination = new AudioNode();
  oscillators: AudioNode[] = [];
  gains: AudioNode[] = [];
  filter = new AudioNode();
  closeCount = 0;
  createGain() {
    const node = new AudioNode();
    this.gains.push(node);
    return node;
  }
  createBiquadFilter() {
    return this.filter;
  }
  createDynamicsCompressor() {
    return new AudioNode();
  }
  createOscillator() {
    const node = new AudioNode();
    this.oscillators.push(node);
    return node;
  }
  async resume() {
    this.state = "running";
  }
  async suspend() {
    this.state = "suspended";
  }
  async close() {
    this.state = "closed";
    this.closeCount++;
  }
}

const nativeContext = globalThis.AudioContext;
let engine: ReturnType<typeof createRewindAudio> | undefined;

function setup() {
  globalThis.AudioContext = AudioContextFixture as unknown as typeof AudioContext;
  engine = createRewindAudio();
  return { context: AudioContextFixture.last, audio: engine };
}

afterEach(() => {
  engine?.dispose();
  engine = undefined;
  globalThis.AudioContext = nativeContext;
});

describe("Replay audio engine", () => {
  test("starts suspended, then schedules original notes only after resume", async () => {
    const { context, audio } = setup();
    expect(context.state).toBe("suspended");
    expect(context.oscillators).toHaveLength(4);
    await audio.play();
    expect(context.state).toBe("running");
    expect(context.oscillators.length).toBeGreaterThan(4);
    expect(context.oscillators.at(-1)?.type).toBe(REWIND_AUDIO_PROFILES.story.lead);
  });

  test("crossfades pads and schedules square-wave game notes, then switches back for books", async () => {
    const { context, audio } = setup();
    const oldPads = [...context.oscillators];
    audio.phase(10, "game");
    expect(oldPads.every((oscillator) => oscillator.stops.includes(10.3))).toBe(true);
    expect(context.filter.frequency.value).toBe(REWIND_AUDIO_PROFILES.game.cutoff);
    await audio.play();
    expect(context.oscillators.at(-1)?.type).toBe("square");
    await audio.pause();
    audio.phase(14, "book");
    await audio.play();
    expect(context.oscillators.at(-1)?.type).toBe("sine");
    expect(context.filter.frequency.value).toBe(REWIND_AUDIO_PROFILES.book.cutoff);
  });

  test("updates harmony without restarting pad voices inside the same category", () => {
    const { context, audio } = setup();
    audio.phase(10, "game");
    const count = context.oscillators.length;
    audio.phase(11, "game");
    expect(context.oscillators).toHaveLength(count);
    expect(context.oscillators.at(-1)?.frequency.targets.length).toBeGreaterThan(1);
  });

  test("supports silent volume, pause/resume, and idempotent cleanup of every oscillator", async () => {
    const { context, audio } = setup();
    await audio.play();
    audio.volume(0);
    expect(context.gains[0].gain.value).toBe(0);
    await audio.pause();
    expect(context.state).toBe("suspended");
    await audio.play();
    expect(context.state).toBe("running");
    audio.dispose();
    audio.dispose();
    expect(context.closeCount).toBe(1);
    expect(context.oscillators.every((oscillator) => oscillator.stops.length > 0)).toBe(true);
    expect(context.filter.disconnected).toBe(true);
    await audio.play();
    expect(context.state).toBe("closed");
  });
});
