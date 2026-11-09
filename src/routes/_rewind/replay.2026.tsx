import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RewindCategory } from "@/components/rewind/rewind-category";
import { RewindControls } from "@/components/rewind/rewind-controls";
import { RewindFirstTitle } from "@/components/rewind/rewind-first-title";
import { RewindGlobal } from "@/components/rewind/rewind-global";
import { RewindHero } from "@/components/rewind/rewind-hero";
import { RewindOutro } from "@/components/rewind/rewind-outro";
import { RewindOverview } from "@/components/rewind/rewind-overview";
import { RewindRhythm } from "@/components/rewind/rewind-rhythm";
import { RewindScene } from "@/components/rewind/rewind-scene";
import { RewindShelf } from "@/components/rewind/rewind-shelf";
import { RewindStage } from "@/components/rewind/rewind-stage";
import { AuthModal } from "@/components/shared/header/auth-modal";
import { REWIND_YEAR } from "@/constants/rewind";
import { useRewind } from "@/hooks/use-rewind";
import { useRewindAudio } from "@/hooks/use-rewind-audio";
import { useRewindStory } from "@/hooks/use-rewind-story";
import { useSession } from "@/lib/auth/client";
import i18n from "@/lib/i18n/config";
import { seo } from "@/lib/utils/seo";
import { buildRewindScenes, rewindSceneLabel } from "@/utils/rewind-scenes";

export const Route = createFileRoute("/_rewind/replay/2026")({
  head: () => ({
    meta: [
      ...seo({
        title: i18n.t("rewind:pageTitle", { year: REWIND_YEAR }),
        description: i18n.t("rewind:pageDescription", { year: REWIND_YEAR }),
      }),
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#191525" },
    ],
  }),
  component: RewindRoute,
});

function RewindRoute() {
  const { t } = useTranslation();
  const session = useSession();
  const userId = session.data?.user.id;
  const { personal, global } = useRewind(userId);
  const rewind = userId ? personal.data : undefined;
  const scenes = useMemo(() => buildRewindScenes(rewind), [rewind]);
  const story = useRewindStory(scenes.length);
  const activeScene = scenes[story.activeIndex];
  const audioMood =
    activeScene?.kind === "category" || activeScene?.kind === "shelf" ? activeScene.category.type : "story";
  const audio = useRewindAudio(story.activeIndex, audioMood);
  const isPreview = rewind?.isPreview ?? global.data?.isPreview ?? new Date().getUTCFullYear() <= REWIND_YEAR;

  return (
    <div
      data-replay-root
      className="bg-replay-ink font-replay text-base leading-normal text-replay-paper antialiased selection:bg-replay-ink selection:text-replay-pink [font-synthesis:none] [font-variation-settings:normal] [&_button]:cursor-pointer [&_h1]:text-balance [&_h2]:min-w-0 [&_h2]:wrap-break-word [&_p]:text-pretty **:focus-visible:outline-3 **:focus-visible:outline-offset-4 **:focus-visible:outline-current motion-reduce:**:animate-none motion-reduce:**:scroll-auto motion-reduce:**:transition-none"
    >
      <RewindControls scenes={scenes} activeIndex={story.activeIndex} onNavigate={story.goTo} audio={audio} />
      <RewindStage
        rootRef={story.rootRef}
        animated={story.animated}
        sceneCount={scenes.length}
        onProgress={story.onProgress}
      >
        {scenes.map((scene, index) => (
          <RewindScene
            key={scene.id}
            id={scene.id}
            index={index}
            label={rewindSceneLabel(scene, t)}
            active={index === story.activeIndex}
          >
            {scene.kind === "intro" && (
              <RewindHero
                signedIn={!!userId}
                loading={session.isPending || (!!userId && personal.isPending)}
                failed={!!userId && personal.isError}
                empty={!!rewind && rewind.tracked === 0}
                isPreview={isPreview}
                onStart={() => story.goTo(1)}
                onRetry={() => void personal.refetch()}
                onGlobal={() => story.goTo(scenes.findIndex((item) => item.kind === "global"))}
              />
            )}
            {scene.kind === "overview" && rewind && <RewindOverview rewind={rewind} />}
            {scene.kind === "first" && rewind?.first && <RewindFirstTitle title={rewind.first} />}
            {scene.kind === "rhythm" && rewind && <RewindRhythm monthly={rewind.monthly} />}
            {scene.kind === "category" && <RewindCategory category={scene.category} />}
            {scene.kind === "shelf" && rewind && (
              <RewindShelf category={scene.category} favoriteBonus={rewind.reviewFavoriteBonus} />
            )}
            {scene.kind === "global" && (
              <RewindGlobal
                rewind={global.data}
                loading={global.isPending}
                failed={global.isError}
                onRetry={() => void global.refetch()}
              />
            )}
            {scene.kind === "outro" && <RewindOutro rewind={rewind} onRestart={() => story.goTo(0)} />}
          </RewindScene>
        ))}
      </RewindStage>
      <AuthModal showTrigger={false} />
    </div>
  );
}
