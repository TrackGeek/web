import type { OgMediaType } from "@/lib/og/media-source";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

export const ogUrl = {
  page: (title: string, description?: string) => {
    const params = new URLSearchParams({ title });

    if (description) params.set("description", description);

    return `/api/og/page?${params}`;
  },
  media: (type: OgMediaType, slug: string) => `/api/og/media/${type}/${encodeURIComponent(slug)}`,
  user: (username: string) => `/api/og/user/${encodeURIComponent(username)}`,
};
