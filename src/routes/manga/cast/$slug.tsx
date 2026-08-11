import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PersonPage } from "@/components/pages/person/person-page.tsx";
import type { Person } from "@/components/pages/person/types.ts";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { api, apiEndpoints } from "@/lib/api.ts";
import { personJsonLd } from "@/lib/utils/json-ld.ts";
import { seo, stripMarkdown } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/manga/cast/$slug")({
  loader: async ({ params }) => {
    const person: Person = await api.get(apiEndpoints.getMangaCast(params.slug)).then(({ data }) => data.person);
    return { person };
  },
  head: ({ loaderData }) => {
    const person = loaderData?.person;
    const topTitles = (person?.credits ?? [])
      .slice(0, 3)
      .map((credit) => credit.title)
      .join(", ");
    const biography = person?.biography ? stripMarkdown(person.biography) : null;

    return {
      meta: [
        ...seo({
          title: person?.name ?? "Cast",
          description: biography ?? (topTitles ? `${person?.name} — known for ${topTitles}.` : undefined) ?? undefined,
          image: person?.imageUrl ?? undefined,
        }),
      ],
      scripts: [
        personJsonLd({
          name: person?.name,
          description: biography ?? undefined,
          image: person?.imageUrl ?? undefined,
          birthDate: person?.birthday ? person.birthday.slice(0, 10) : undefined,
          deathDate: person?.deathday ? person.deathday.slice(0, 10) : undefined,
          birthPlace: person?.placeOfBirth ?? undefined,
          jobTitle: person?.knownForDepartment ?? undefined,
          sameAs: person?.external?.anilist ? [person.external.anilist] : undefined,
        }),
      ],
    };
  },
  component: MangaCastRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function MangaCastRoute() {
  const { person } = Route.useLoaderData();
  const { t } = useTranslation();

  return <PersonPage person={person} creditsHeading={t("library:catalog")} />;
}
