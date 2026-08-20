import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 20;

export function walletQueryKey() {
  return ["coins", "me"];
}

export function coinHistoryQueryKey() {
  return ["coins", "history"];
}

export function useMyWallet(enabled = true) {
  return useQuery({
    queryKey: walletQueryKey(),
    queryFn: () => api.get<ApiTypes.GetWalletResponse>(apiEndpoints.getMyWallet).then(({ data }) => data.wallet),
    enabled,
  });
}

export function useCoinHistory() {
  return useInfiniteQuery({
    queryKey: coinHistoryQueryKey(),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetCoinHistoryResponse>(apiEndpoints.getCoinHistory, {
          params: { page: pageParam, itemsPerPage: ITEMS_PER_PAGE },
        })
        .then(({ data }) => data.history),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}
