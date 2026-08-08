import { useEffect, useMemo } from "react";
import { useSession } from "@/lib/auth/client";
import { CONTENT_TYPE_SLUGS, type ContentTypeSlug, toContentTypeSlug } from "@/lib/content-types";

export interface VisibleContentTypes {
  visible: ContentTypeSlug[];
  isVisible: (type: ContentTypeSlug) => boolean;
  hiddenClass: (type: ContentTypeSlug) => string;
}

export function useContentTypes(): VisibleContentTypes {
  const session = useSession();

  const stored = session.data?.user?.profile?.contentTypes as string[] | undefined;

  const visible = useMemo(() => {
    const slugs = (stored ?? [])
      .map(toContentTypeSlug)
      .filter((slug): slug is ContentTypeSlug => slug !== null);

    if (slugs.length === 0) return CONTENT_TYPE_SLUGS;

    return CONTENT_TYPE_SLUGS.filter((slug) => slugs.includes(slug));
  }, [stored]);

  return useMemo(
    () => ({
      visible,
      isVisible: (type: ContentTypeSlug) => visible.includes(type),
      hiddenClass: (type: ContentTypeSlug) => (visible.includes(type) ? "" : "hidden"),
    }),
    [visible],
  );
}

export function useVisibleContentType(current: ContentTypeSlug, onFallback: (type: ContentTypeSlug) => void) {
  const { visible } = useContentTypes();

  useEffect(() => {
    if (visible.includes(current)) return;

    onFallback(visible[0]);
  }, [visible, current, onFallback]);
}
