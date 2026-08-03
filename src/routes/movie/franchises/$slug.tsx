import { createFileRoute } from "@tanstack/react-router";
import { FranchisePage } from "@/components/pages/franchise/franchise-page.tsx";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { api, apiEndpoints } from "@/lib/api.ts";
import { seo } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/movie/franchises/$slug")({
  loader: async ({ params }) => {
    const franchise = await api.get(apiEndpoints.getMovieFranchise(params.slug)).then(({ data }) => data.franchise);
    return { franchise };
  },
  head: ({ loaderData }) => {
    const franchise = loaderData?.franchise;
    return {
      meta: [
        ...seo({
          title: franchise?.name ? `${franchise.name} Movies` : "Movie Franchise",
          description: franchise?.overview ?? undefined,
          image: franchise?.posterUrl ?? undefined,
        }),
      ],
    };
  },
  component: MovieFranchiseRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

interface MovieFranchisePart {
  tmdbId: number;
  title: string;
  isAdult: boolean;
  posterUrl: string | null;
}

function MovieFranchiseRoute() {
  const { franchise } = Route.useLoaderData();

  return (
    <FranchisePage
      name={franchise.name}
      description={franchise.overview}
      bannerUrl={franchise.backdropUrl}
      items={(franchise.parts as MovieFranchisePart[]).map((part) => ({
        key: part.tmdbId,
        title: part.title,
        url: `/movie/${part.tmdbId}`,
        imageUrl: part.posterUrl,
        isAdult: part.isAdult,
      }))}
    />
  );
}
