import { useInfiniteQuery } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 18;

export function useSearchUsers(query: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["search-users", query],
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.SearchUsersResponse>(apiEndpoints.searchUsers, {
          params: { query, page: pageParam, itemsPerPage: ITEMS_PER_PAGE },
        })
        .then(({ data }) => data.users),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
    enabled,
  });
}
