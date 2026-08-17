import { useInfiniteQuery } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

export function useSearchPeople(query: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["search-people", query],
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.SearchPeopleResponse>(apiEndpoints.searchPeople, {
          params: { query: query || undefined, page: pageParam },
        })
        .then(({ data }) => data.people),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pages != null && lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined,
    enabled,
  });
}
