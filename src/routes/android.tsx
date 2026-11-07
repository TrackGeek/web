import { createFileRoute } from "@tanstack/react-router";
import { AndroidClose } from "@/components/pages/android/android-close";
import { AndroidDownloads } from "@/components/pages/android/android-downloads";
import { AndroidExperience } from "@/components/pages/android/android-experience";
import { AndroidHero } from "@/components/pages/android/android-hero";
import { AndroidInstances } from "@/components/pages/android/android-instances";
import { AndroidLibrary } from "@/components/pages/android/android-library";
import { AndroidOnboarding } from "@/components/pages/android/android-onboarding";
import i18n from "@/lib/i18n/config";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/android")({
  staticData: { layout: "full" },
  head: () => ({
    meta: seo({ title: i18n.t("pages:android.pageTitle"), description: i18n.t("pages:android.description") }),
  }),
  component: AndroidRoute,
});

function AndroidRoute() {
  return (
    <div className="overflow-x-clip bg-android-paper text-base leading-[1.7] text-android-ink selection:bg-android-mint selection:text-android-ink [&_p]:text-android-muted [&_dd]:text-android-muted [&_h2+p]:mt-6 [&_a]:underline-offset-[5px] [&_a:focus-visible]:outline-3 [&_a:focus-visible]:outline-offset-5 [&_a:focus-visible]:outline-android-ink **:[[id]]:scroll-mt-8 motion-reduce:**:animate-none motion-reduce:**:scroll-auto motion-reduce:**:transition-none">
      <AndroidHero />
      <AndroidDownloads />
      <AndroidLibrary />
      <AndroidExperience />
      <AndroidInstances />
      <AndroidOnboarding />
      <AndroidClose />
    </div>
  );
}
