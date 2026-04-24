import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ComparisonTable } from "@/components/pages/compare/comparison-table";
import { Button } from "@/components/ui/button";
import { comparisonCriteria, comparisonEntries, comparisonPlatforms } from "@/lib/comparison.config";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      ...seo({
        title: "TrackGeek vs other media trackers",
        description:
          "Compare TrackGeek against Simkl, AniList, Backloggd, MyLists and StoryGraph. See feature coverage, social tools and tracking depth.",
      }),
    ],
  }),
  component: CompareRoute,
});

function CompareRoute() {
  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-3 py-4 sm:px-4 md:gap-10 md:px-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-card to-muted/20 p-6 shadow-sm md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">Comparison</p>
        <h1 className="mt-2 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-3xl font-black text-transparent md:text-5xl">
          TrackGeek vs rest
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground md:text-base">
          Honest feature-by-feature view of major media tracking platforms. Pick tool matching your workflow.
        </p>
      </section>

      <ComparisonTable criteria={comparisonCriteria} platforms={comparisonPlatforms} entries={comparisonEntries} />

      <section className="rounded-2xl border border-primary/30 bg-primary/10 p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Start tracking with TrackGeek</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Multi-media tracking, social feed, profile stats, imports. All in one place.
            </p>
          </div>

          <Button asChild size="lg" className="min-w-52">
            <a href="/?landing=true">
              Create free account <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
