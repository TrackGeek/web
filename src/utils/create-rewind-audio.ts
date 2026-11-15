import { REWIND_CHORDS } from "@/constants/rewind";
import { REWIND_AUDIO_PROFILES, type RewindAudioMood } from "@/constants/rewind-audio";

export function createRewindAudio() {
  const context = new AudioContext();
  const output = context.createGain();
  const filter = context.createBiquadFilter();
  const compressor = context.createDynamicsCompressor();
  let voices: OscillatorNode[] = [];
  let padGain: GainNode | undefined;
  let mood: RewindAudioMood = "story";
  let profile = REWIND_AUDIO_PROFILES[mood];
  let disposed = false;
  output.gain.value = 0.08;
  filter.type = "lowpass";
  filter.frequency.value = profile.cutoff;
  filter.connect(output);
  output.connect(compressor);
  compressor.connect(context.destination);
  let chord: readonly number[] = REWIND_CHORDS[0];
  let step = 0;
  let nextNote = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const pending = new Set<OscillatorNode>();

  const startPad = () => {
    if (padGain) {
      padGain.gain.setTargetAtTime(0, context.currentTime, 0.05);
      for (const oscillator of voices) oscillator.stop(context.currentTime + 0.3);
    }
    const gain = context.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(profile.padGain, context.currentTime, 0.08);
    gain.connect(filter);
    padGain = gain;
    let remaining = chord.length;
    voices = chord.map((frequency) => {
      const oscillator = context.createOscillator();
      oscillator.type = profile.pad;
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      pending.add(oscillator);
      oscillator.onended = () => {
        pending.delete(oscillator);
        oscillator.disconnect();
        if (--remaining === 0) gain.disconnect();
      };
      oscillator.start();
      return oscillator;
    });
  };

  startPad();

  const schedule = () => {
    if (context.state !== "running") return;
    while (nextNote < context.currentTime + 0.15) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = profile.lead;
      oscillator.frequency.value = chord[step % chord.length] * (step % 8 < 4 ? profile.octave : profile.octave / 2);
      gain.gain.setValueAtTime(0, nextNote);
      gain.gain.linearRampToValueAtTime(profile.leadGain, nextNote + profile.attack);
      gain.gain.exponentialRampToValueAtTime(0.001, nextNote + profile.release);
      oscillator.connect(gain);
      gain.connect(filter);
      pending.add(oscillator);
      oscillator.onended = () => {
        pending.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(nextNote);
      oscillator.stop(nextNote + profile.release + 0.05);
      nextNote += profile.beat;
      step++;
    }
  };

  return {
    async play() {
      if (disposed) return;
      await context.resume();
      if (disposed) return;
      if (context.state !== "running") throw new Error("Audio context did not start");
      nextNote = context.currentTime + 0.05;
      if (timer) clearInterval(timer);
      timer = setInterval(schedule, 75);
      schedule();
    },
    async pause() {
      if (timer) clearInterval(timer);
      timer = undefined;
      if (!disposed) await context.suspend();
    },
    phase(index: number, nextMood: RewindAudioMood = "story") {
      if (disposed) return;
      chord = REWIND_CHORDS[index % REWIND_CHORDS.length];
      if (nextMood !== mood) {
        mood = nextMood;
        profile = REWIND_AUDIO_PROFILES[mood];
        filter.frequency.setTargetAtTime(profile.cutoff, context.currentTime, 0.2);
        startPad();
      }
      for (const [voiceIndex, oscillator] of voices.entries()) {
        oscillator.frequency.setTargetAtTime(chord[voiceIndex], context.currentTime, 0.4);
      }
    },
    volume(value: number) {
      output.gain.setTargetAtTime(value * 0.16, context.currentTime, 0.1);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (timer) clearInterval(timer);
      for (const oscillator of pending) oscillator.stop();
      filter.disconnect();
      output.disconnect();
      compressor.disconnect();
      void context.close();
    },
  };
}
