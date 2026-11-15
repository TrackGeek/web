import type { ContentTypeSlug } from "@/lib/content-types";

export type RewindAudioMood = ContentTypeSlug | "story";

interface RewindAudioProfile {
  pad: OscillatorType;
  lead: OscillatorType;
  beat: number;
  attack: number;
  release: number;
  octave: number;
  cutoff: number;
  padGain: number;
  leadGain: number;
}

export const REWIND_AUDIO_PROFILES: Record<RewindAudioMood, RewindAudioProfile> = {
  story: {
    pad: "sine",
    lead: "triangle",
    beat: 0.375,
    attack: 0.02,
    release: 0.7,
    octave: 2,
    cutoff: 3200,
    padGain: 0.1,
    leadGain: 0.22,
  },
  movie: {
    pad: "sawtooth",
    lead: "sine",
    beat: 0.5,
    attack: 0.15,
    release: 1.4,
    octave: 1,
    cutoff: 1400,
    padGain: 0.035,
    leadGain: 0.24,
  },
  tv: {
    pad: "triangle",
    lead: "triangle",
    beat: 0.3,
    attack: 0.03,
    release: 0.45,
    octave: 2,
    cutoff: 2600,
    padGain: 0.075,
    leadGain: 0.2,
  },
  anime: {
    pad: "sawtooth",
    lead: "triangle",
    beat: 0.23,
    attack: 0.01,
    release: 0.5,
    octave: 2,
    cutoff: 4200,
    padGain: 0.04,
    leadGain: 0.2,
  },
  game: {
    pad: "triangle",
    lead: "square",
    beat: 0.15,
    attack: 0.004,
    release: 0.12,
    octave: 2,
    cutoff: 6000,
    padGain: 0.07,
    leadGain: 0.095,
  },
  manga: {
    pad: "sine",
    lead: "sine",
    beat: 0.34,
    attack: 0.008,
    release: 0.85,
    octave: 4,
    cutoff: 4800,
    padGain: 0.08,
    leadGain: 0.22,
  },
  book: {
    pad: "sine",
    lead: "sine",
    beat: 0.65,
    attack: 0.12,
    release: 1.7,
    octave: 2,
    cutoff: 1800,
    padGain: 0.07,
    leadGain: 0.16,
  },
};
