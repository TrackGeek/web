import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const REFETCH_INTERVAL = 15_000;

export function useDiscordPresence(userId: string) {
  return useQuery({
    queryKey: ["discord-presence", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetDiscordPresenceResponse>(apiEndpoints.getDiscordPresenceByUserId(userId))
        .then(({ data }) => data.presence),
    enabled: !!userId,
    staleTime: 10_000,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useNow(active: boolean, intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!active) {
      setNow(null);

      return;
    }

    setNow(Date.now());

    const interval = setInterval(() => setNow(Date.now()), intervalMs);

    return () => clearInterval(interval);
  }, [active, intervalMs]);

  return now;
}
