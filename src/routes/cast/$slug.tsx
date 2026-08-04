import { createFileRoute } from "@tanstack/react-router";
import { PersonPage } from "@/components/pages/person/person-page.tsx";
import type { Person } from "@/components/pages/person/types.ts";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { api, apiEndpoints } from "@/lib/api.ts";
import { personJsonLd } from "@/lib/utils/json-ld.ts";
import { seo } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/cast/$slug")({
  loader: async ({ params }) => {
    const person: Person = await api.get(apiEndpoints.getPerson(params.slug)).then(({ data }) => data.person);
    return { person };
  },
  head: ({ loaderData }) => {
    const person = loaderData?.person;
    const topTitles = (person?.credits ?? [])
      .slice(0, 3)
      .map((credit) => credit.title)
      .join(", ");

    return {
      meta: [
        ...seo({
          title: person?.name ?? "Cast",
          description:
            person?.biography ?? (topTitles ? `${person?.name} — known for ${topTitles}.` : undefined) ?? undefined,
          image: person?.imageUrl ?? undefined,
        }),
      ],
      scripts: [
        personJsonLd({
          name: person?.name,
          description: person?.biography ?? undefined,
          image: person?.imageUrl ?? undefined,
          birthDate: person?.birthday ? person.birthday.slice(0, 10) : undefined,
          deathDate: person?.deathday ? person.deathday.slice(0, 10) : undefined,
          birthPlace: person?.placeOfBirth ?? undefined,
          jobTitle: person?.knownForDepartment ?? undefined,
          sameAs: person?.external?.imdb_id ? [`https://www.imdb.com/name/${person.external.imdb_id}`] : undefined,
        }),
      ],
    };
  },
  component: CastRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function CastRoute() {
  const { person } = Route.useLoaderData();

  return <PersonPage person={person} />;
}
