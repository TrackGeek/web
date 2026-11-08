import { useQuery } from "@tanstack/react-query";
import { api, apiEndpoints } from "@/lib/api";
import type { GlobalRewind, PersonalRewind } from "@/types/rewind";

export function useRewind(userId?: string) {
  const personal = useQuery({
    queryKey: ["rewind", 2026, "personal", userId],
    queryFn: ({ signal }) =>
      api.get<{ rewind: PersonalRewind }>(apiEndpoints.getPersonalRewind, { signal }).then(({ data }) => data.rewind),
    enabled: !!userId,
    staleTime: 60_000,
    gcTime: 0,
    retry: 1,
  });

  const global = useQuery({
    queryKey: ["rewind", 2026, "global"],
    queryFn: ({ signal }) =>
      api.get<{ rewind: GlobalRewind }>(apiEndpoints.getGlobalRewind, { signal }).then(({ data }) => data.rewind),
    staleTime: 300_000,
    retry: 1,
  });

  return { personal, global };
}
