type JsonLdObject = Record<string, unknown>;

const getOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : (import.meta.env.VITE_SITE_URL ?? "");

const getUrl = () => (typeof document !== "undefined" ? document.URL : "");

const absoluteUrl = (path?: string) => {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${getOrigin()}${path}`;
};

const clean = (obj: JsonLdObject): JsonLdObject =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""));

export const jsonLdScript = (data: JsonLdObject) => ({
  type: "application/ld+json" as const,
  children: JSON.stringify({ "`@context`": "https://schema.org", ...data }).replace(/</g, "\\u003c"),
});

export const organizationJsonLd = () =>
  jsonLdScript({
    "@type": "Organization",
    name: "TrackGeek",
    url: getOrigin(),
    logo: absoluteUrl("/logo-128.png"),
    sameAs: ["https://x.com/TrackGeekOfc"],
  });

export const websiteJsonLd = () => {
  const origin = getOrigin();
  return jsonLdScript({
    "@type": "WebSite",
    name: "TrackGeek",
    url: origin,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${origin}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
};

interface PersonJsonLdOptions {
  name?: string;
  description?: string;
  image?: string;
  url?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  jobTitle?: string;
  sameAs?: string[];
}

export const personJsonLd = ({
  name,
  description,
  image,
  url,
  birthDate,
  deathDate,
  birthPlace,
  jobTitle,
  sameAs,
}: PersonJsonLdOptions) =>
  jsonLdScript(
    clean({
      "@type": "Person",
      name,
      description,
      image: absoluteUrl(image),
      url: url ?? getUrl(),
      birthDate,
      deathDate,
      birthPlace: birthPlace ? { "@type": "Place", name: birthPlace } : undefined,
      jobTitle,
      sameAs: sameAs && sameAs.length > 0 ? sameAs : undefined,
    }),
  );

interface MediaJsonLdOptions {
  type: "VideoGame" | "Movie" | "TVSeries" | "Book" | "CreativeWork";
  name?: string;
  description?: string;
  image?: string;
  url?: string;
  rating?: number;
  ratingCount?: number;
  extra?: JsonLdObject;
}

export const mediaJsonLd = ({
  type,
  name,
  description,
  image,
  url,
  rating,
  ratingCount,
  extra,
}: MediaJsonLdOptions) => {
  const aggregateRating =
    rating && rating > 0
      ? clean({
          "@type": "AggregateRating",
          ratingValue: rating,
          bestRating: 5,
          worstRating: 0,
          ratingCount: ratingCount && ratingCount > 0 ? ratingCount : undefined,
        })
      : undefined;

  return jsonLdScript({
    "@type": type,
    name,
    description,
    image: absoluteUrl(image),
    url: url ?? getUrl(),
    aggregateRating,
    ...clean(extra ?? {}),
  });
};
