import { useCallback, useEffect, useRef, useState } from "react";
import type { RewindAudioMood } from "@/constants/rewind-audio";
import { createRewindAudio } from "@/utils/create-rewind-audio";

export function useRewindAudio(phase: number, mood: RewindAudioMood) {
  const engine = useRef<ReturnType<typeof createRewindAudio> | null>(null);
  const wanted = useRef(true);
  const mounted = useRef(false);
  const playingRef = useRef(false);
  const attempt = useRef(0);
  const settings = useRef({ phase, mood, volume: 0.5 });
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [failed, setFailed] = useState(false);
  settings.current = { phase, mood, volume };

  useEffect(() => {
    engine.current?.phase(phase, mood);
  }, [phase, mood]);

  useEffect(() => {
    engine.current?.volume(volume);
  }, [volume]);

  const start = useCallback(async () => {
    if (!mounted.current || !wanted.current || document.hidden || playingRef.current) return;
    const currentAttempt = ++attempt.current;
    setFailed(false);
    try {
      engine.current ??= createRewindAudio();
      engine.current.phase(settings.current.phase, settings.current.mood);
      engine.current.volume(settings.current.volume);
      await engine.current.play();
      if (currentAttempt !== attempt.current || !mounted.current || !wanted.current || document.hidden) return;
      playingRef.current = true;
      setPlaying(true);
    } catch {
      if (currentAttempt !== attempt.current || !mounted.current) return;
      setFailed(true);
      setPlaying(false);
      engine.current?.dispose();
      engine.current = null;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void start();
    const onGesture = (event: Event) => {
      if (event.target instanceof Element && event.target.closest("[data-replay-audio-control]")) return;
      void start();
    };
    const onVisibility = () => {
      if (document.hidden) {
        attempt.current++;
        playingRef.current = false;
        setPlaying(false);
        void engine.current?.pause();
      } else {
        void start();
      }
    };
    document.addEventListener("pointerdown", onGesture);
    document.addEventListener("keydown", onGesture);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mounted.current = false;
      attempt.current++;
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
      document.removeEventListener("visibilitychange", onVisibility);
      engine.current?.dispose();
      engine.current = null;
    };
  }, [start]);

  function toggle() {
    setFailed(false);
    if (playingRef.current) {
      wanted.current = false;
      attempt.current++;
      playingRef.current = false;
      setPlaying(false);
      void engine.current?.pause();
    } else {
      wanted.current = true;
      void start();
    }
  }

  return { playing, failed, volume, setVolume, toggle };
}
