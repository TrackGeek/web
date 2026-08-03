import { createFileRoute } from "@tanstack/react-router";
import { FranchisePage } from "@/components/pages/franchise/franchise-page.tsx";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { api, apiEndpoints } from "@/lib/api.ts";
import { seo } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/game/franchises/$slug")({
  loader: async ({ params }) => {
    const franchise = await api.get(apiEndpoints.getGameFranchise(params.slug)).then(({ data }) => data.franchise);
    return { franchise };
  },
  head: ({ loaderData }) => {
    const franchise = loaderData?.franchise;
    return {
      meta: [
        ...seo({
          title: franchise?.name ? `${franchise.name} Games` : "Game Franchise",
          image: franchise?.bannerUrl ?? undefined,
        }),
      ],
    };
  },
  component: GameFranchiseRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

interface FranchiseGame {
  igdbId: number;
  name: string;
  coverUrl: string | null;
}

function GameFranchiseRoute() {
  const { franchise } = Route.useLoaderData();

  return (
    <FranchisePage
      name={franchise.name}
      bannerUrl={franchise.bannerUrl}
      items={(franchise.games as FranchiseGame[]).map((game) => ({
        key: game.igdbId,
        title: game.name,
        url: `/game/${game.igdbId}`,
        imageUrl: game.coverUrl,
      }))}
    />
  );
}
