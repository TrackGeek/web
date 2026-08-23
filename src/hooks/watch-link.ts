import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth/client";

const WATCH_LINKS_KEY = ["watchLinks"];

export function useWatchLinks() {
  const session = useSession();

  return useQuery<ApiTypes.WatchLink[]>({
    queryKey: WATCH_LINKS_KEY,
    queryFn: () =>
      api.get<ApiTypes.GetWatchLinksResponse>(apiEndpoints.getWatchLinks).then(({ data }) => data.watchLinks),
    enabled: !!session.data?.session,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWatchLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ApiTypes.CreateWatchLinkRequest) =>
      api.post<ApiTypes.WatchLinkResponse>(apiEndpoints.createWatchLink, body).then(({ data }) => data.watchLink),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WATCH_LINKS_KEY }),
  });
}

export function useUpdateWatchLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId, ...body }: ApiTypes.UpdateWatchLinkRequest & { linkId: string }) =>
      api
        .patch<ApiTypes.WatchLinkResponse>(apiEndpoints.updateWatchLink(linkId), body)
        .then(({ data }) => data.watchLink),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WATCH_LINKS_KEY }),
  });
}

export function useDeleteWatchLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => api.delete(apiEndpoints.deleteWatchLink(linkId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WATCH_LINKS_KEY }),
  });
}

export function useReorderWatchLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkIds: string[]) => api.patch(apiEndpoints.reorderWatchLinks, { linkIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WATCH_LINKS_KEY }),
  });
}
