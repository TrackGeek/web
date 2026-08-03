import { createFileRoute } from "@tanstack/react-router";
import { FranchisePage } from "@/components/pages/franchise/franchise-page.tsx";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { api, apiEndpoints } from "@/lib/api.ts";
import { seo } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/book/franchises/$slug")({
  loader: async ({ params }) => {
    const franchise = await api.get(apiEndpoints.getBookFranchise(params.slug)).then(({ data }) => data.franchise);
    return { franchise };
  },
  head: ({ loaderData }) => {
    const franchise = loaderData?.franchise;
    return {
      meta: [
        ...seo({
          title: franchise?.name ? `${franchise.name} Books` : "Book Series",
          description: franchise?.description ?? undefined,
          image: franchise?.imageUrl ?? undefined,
        }),
      ],
    };
  },
  component: BookFranchisesRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

interface SeriesBook {
  hardcoverId: number;
  title: string;
  imageUrl: string | null;
}

function BookFranchisesRoute() {
  const { franchise } = Route.useLoaderData();

  return (
    <FranchisePage
      name={franchise.name}
      description={franchise.description}
      items={(franchise.books as SeriesBook[]).map((book) => ({
        key: book.hardcoverId,
        title: book.title,
        url: `/book/${book.hardcoverId}`,
        imageUrl: book.imageUrl,
      }))}
    />
  );
}
