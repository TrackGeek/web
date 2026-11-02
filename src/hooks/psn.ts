import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth/client";

const PSN_ACCOUNT_KEY = ["psn-account"];
const PSN_TROPHIES_KEY = "psn-trophies";

export function usePsnTrophies(userId: string) {
  return useQuery({
    queryKey: [PSN_TROPHIES_KEY, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetPsnTrophiesResponse>(apiEndpoints.getPsnTrophiesByUserId(userId))
        .then(({ data }) => data.trophies),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefreshPsnTrophies(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.post<ApiTypes.RefreshPsnTrophiesResponse>(apiEndpoints.refreshPsnTrophies).then(({ data }) => data.trophies),
    onSuccess: (trophies) => {
      queryClient.setQueryData([PSN_TROPHIES_KEY, userId], trophies);

      return queryClient.invalidateQueries({ queryKey: PSN_ACCOUNT_KEY });
    },
  });
}

export function usePsnAccount() {
  const session = useSession();

  return useQuery({
    queryKey: PSN_ACCOUNT_KEY,
    queryFn: () => api.get<ApiTypes.GetPsnAccountResponse>(apiEndpoints.psnAccount).then(({ data }) => data.account),
    enabled: !!session.data?.session,
  });
}

function useInvalidatePsn() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: PSN_ACCOUNT_KEY }),
      queryClient.invalidateQueries({ queryKey: [PSN_TROPHIES_KEY] }),
    ]);
}

export function useLinkPsnAccount() {
  const invalidatePsn = useInvalidatePsn();

  return useMutation({
    mutationFn: (body: ApiTypes.LinkPsnAccountRequest) =>
      api.put<ApiTypes.LinkPsnAccountResponse>(apiEndpoints.psnAccount, body).then(({ data }) => data.account),
    onSuccess: invalidatePsn,
  });
}

export function useUnlinkPsnAccount() {
  const invalidatePsn = useInvalidatePsn();

  return useMutation({
    mutationFn: () => api.delete(apiEndpoints.psnAccount),
    onSuccess: invalidatePsn,
  });
}
