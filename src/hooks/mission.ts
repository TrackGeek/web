import { useQuery } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

export function missionsQueryKey(userId?: string) {
  return userId ? ["missions", userId] : ["missions", "me"];
}

export function useMyMissions(enabled = true) {
  return useQuery({
    queryKey: missionsQueryKey(),
    queryFn: () => api.get<ApiTypes.GetMissionsResponse>(apiEndpoints.getMyMissions).then(({ data }) => data.missions),
    enabled,
  });
}

export function useMissionsByUserId(userId: string, enabled = true) {
  return useQuery({
    queryKey: missionsQueryKey(userId),
    queryFn: () =>
      api.get<ApiTypes.GetMissionsResponse>(apiEndpoints.getMissionsByUserId(userId)).then(({ data }) => data.missions),
    enabled,
  });
}
