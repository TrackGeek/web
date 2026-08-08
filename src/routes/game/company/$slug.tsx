import { createFileRoute } from "@tanstack/react-router";
import { CompanyPage } from "@/components/pages/company/company-page.tsx";
import type { Company } from "@/components/pages/company/types.ts";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { api, apiEndpoints } from "@/lib/api.ts";
import { companyJsonLd } from "@/lib/utils/json-ld.ts";
import { seo } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/game/company/$slug")({
  loader: async ({ params }) => {
    const company: Company = await api.get(apiEndpoints.getGameCompany(params.slug)).then(({ data }) => data.company);
    return { company };
  },
  head: ({ loaderData }) => {
    const company = loaderData?.company;
    const topTitles = (company?.works ?? [])
      .slice(0, 3)
      .map((work) => work.title)
      .join(", ");

    return {
      meta: [
        ...seo({
          title: company?.name ? `${company.name} Games` : "Game Company",
          description:
            company?.description ?? (topTitles ? `${company?.name} — known for ${topTitles}.` : undefined) ?? undefined,
          image: company?.logoUrl ?? undefined,
        }),
      ],
      scripts: [
        companyJsonLd({
          name: company?.name,
          description: company?.description ?? undefined,
          logo: company?.logoUrl ?? undefined,
          foundingDate: company?.foundedAt ? company.foundedAt.slice(0, 10) : undefined,
          sameAs: company?.homepage ? [company.homepage] : undefined,
        }),
      ],
    };
  },
  component: GameCompanyRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function GameCompanyRoute() {
  const { company } = Route.useLoaderData();

  return <CompanyPage company={company} />;
}
