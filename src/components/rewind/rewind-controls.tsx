import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { useRewindAudio } from "@/hooks/use-rewind-audio";
import type { RewindScene } from "@/types/rewind";
import { rewindSceneLabel } from "@/utils/rewind-scenes";

interface RewindControlsProps {
  scenes: RewindScene[];
  activeIndex: number;
  onNavigate: (index: number) => void;
  audio: ReturnType<typeof useRewindAudio>;
}

export function RewindControls({ scenes, activeIndex, onNavigate, audio }: RewindControlsProps) {
  const { t } = useTranslation();
  const control =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-replay-paper/15 disabled:cursor-default disabled:opacity-30";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 bg-replay-ink text-replay-paper">
        <div className="mx-auto flex h-16 max-w-360 items-center justify-between gap-3 px-4 sm:px-10 lg:px-16">
          <Link
            to="/"
            search={{ landing: "true" }}
            className="flex min-h-11 items-center gap-2 text-base font-bold focus-visible:outline-3 focus-visible:outline-offset-4"
            aria-label={t("rewind:back")}
          >
            <Icon icon="lucide:rewind" className="size-5 text-replay-pink" aria-hidden="true" />
            TrackGeek
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className={`${control} sm:w-auto sm:gap-2 sm:px-3`}
              onClick={audio.toggle}
              data-replay-audio-control
              aria-pressed={audio.playing}
              aria-label={t(audio.playing ? "rewind:controls.mute" : "rewind:controls.unmute")}
              title={t("rewind:controls.originalAudio")}
            >
              <Icon
                icon={audio.playing ? "lucide:volume-2" : "lucide:volume-x"}
                className="size-5"
                aria-hidden="true"
              />
              <span className="hidden text-sm sm:inline">
                {t(audio.playing ? "rewind:controls.soundOn" : "rewind:controls.soundOff")}
              </span>
            </button>
            {audio.playing && (
              <input
                type="range"
                data-replay-audio-control
                min={0}
                max={1}
                step={0.05}
                value={audio.volume}
                onChange={(event) => audio.setVolume(Number(event.target.value))}
                aria-label={t("rewind:controls.volume")}
                className="hidden w-18 accent-replay-pink sm:block"
              />
            )}
            <Link
              to="/"
              search={{ landing: "true" }}
              className={control}
              aria-label={t("rewind:controls.exit")}
              title={t("rewind:controls.exit")}
            >
              <Icon icon="lucide:x" className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <nav aria-label={t("rewind:controls.chapters")} className="mx-auto flex max-w-360 gap-1 px-4 sm:px-10 lg:px-16">
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => onNavigate(index)}
              aria-label={rewindSceneLabel(scene, t)}
              aria-current={index === activeIndex ? "step" : undefined}
              className="group flex min-h-11 min-w-0 flex-1 items-center"
              title={rewindSceneLabel(scene, t)}
            >
              <span
                className={`h-1 w-full rounded-full group-hover:bg-replay-pink ${index <= activeIndex ? "bg-replay-pink" : "bg-replay-paper/25"}`}
              />
            </button>
          ))}
        </nav>
      </header>
      {audio.failed && (
        <p
          role="alert"
          className="fixed inset-x-0 bottom-0 z-30 bg-replay-ink px-4 py-3 text-center text-xs text-replay-paper"
        >
          {t("rewind:controls.audioError")}
        </p>
      )}
    </>
  );
}
