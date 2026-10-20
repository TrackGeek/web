import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/client";
import { queryClient } from "@/lib/tanstack-query";
import { containsBook } from "@/utils/contains-book";

export function useRefreshBookCovers() {
  const { i18n } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();
  const identity = `${i18n.language}:${session?.user.id ?? ""}`;
  const previousIdentity = useRef(identity);

  useEffect(() => {
    if (previousIdentity.current === identity) return;
    previousIdentity.current = identity;
    const filters = { predicate: (query: { state: { data: unknown } }) => containsBook(query.state.data) };
    void queryClient.cancelQueries(filters).then(() => queryClient.invalidateQueries(filters));
    void router.invalidate();
  }, [identity, router]);
}
