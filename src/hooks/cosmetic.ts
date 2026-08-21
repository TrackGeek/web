import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletQueryKey } from "@/hooks/coin";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

export function cosmeticsQueryKey() {
  return ["cosmetics"];
}

export function useCosmetics(enabled = true) {
  return useQuery({
    queryKey: cosmeticsQueryKey(),
    queryFn: () => api.get<ApiTypes.GetCosmeticsResponse>(apiEndpoints.getCosmetics).then(({ data }) => data),
    enabled,
  });
}

export function usePurchaseCosmetic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, key }: { type: ApiTypes.CosmeticType; key: string }) =>
      api
        .post<ApiTypes.PurchaseCosmeticResponse>(apiEndpoints.purchaseCosmetic, { type, key })
        .then(({ data }) => data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cosmeticsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: walletQueryKey() }),
      ]);
    },
  });
}
