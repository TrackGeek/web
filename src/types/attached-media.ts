import type { ContentTypeSlug } from "@/lib/content-types";

export interface AttachedMedia {
  type: ContentTypeSlug;
  externalId: number;
  title: string;
  imageURL: string | null;
}
