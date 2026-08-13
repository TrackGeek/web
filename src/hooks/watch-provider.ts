import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth/client";

export const WATCH_REGION_TOKEN = "trackgeek:watchRegion";

export const DEFAULT_WATCH_REGION = "US";

const REGION_CODE_REGEX = /^[A-Z]{2}$/;

export type WatchMediaType = "movie" | "tv";

function isRegionCode(value: string | null | undefined): value is string {
  return !!value && REGION_CODE_REGEX.test(value);
}

function getBrowserRegion() {
  if (typeof navigator === "undefined") return null;

  for (const language of navigator.languages ?? [navigator.language]) {
    const region = new Intl.Locale(language).maximize().region?.toUpperCase();

    if (isRegionCode(region)) return region;
  }

  return null;
}

export function getStoredWatchRegion() {
  if (typeof window === "undefined") return DEFAULT_WATCH_REGION;

  const fromStorage = window.localStorage.getItem(WATCH_REGION_TOKEN)?.toUpperCase();

  if (isRegionCode(fromStorage)) return fromStorage;

  return getBrowserRegion() ?? DEFAULT_WATCH_REGION;
}

/**
 * The region is kept in localStorage so anonymous visitors keep their choice, and mirrored to the
 * profile whenever the user is signed in so it follows them across devices.
 */
export function useWatchRegion() {
  const session = useSession();

  const profileRegion = session.data?.user?.profile?.watchRegion?.toUpperCase();

  /** Resolved only on the client so the server render and the hydration match. */
  const [region, setRegionState] = useState<string | null>(null);

  useEffect(() => {
    setRegionState(isRegionCode(profileRegion) ? profileRegion : getStoredWatchRegion());
  }, [profileRegion]);

  const saveRegionMutation = useMutation({
    mutationFn: (value: string) => api.patch(apiEndpoints.updateProfile, { watchRegion: value }),
    onSuccess: () => session.refetch(),
  });

  function setRegion(value: string) {
    const nextRegion = value.toUpperCase();

    if (!isRegionCode(nextRegion) || nextRegion === region) return;

    setRegionState(nextRegion);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(WATCH_REGION_TOKEN, nextRegion);
    }

    if (session.data?.session) {
      saveRegionMutation.mutate(nextRegion);
    }
  }

  return {
    region: region ?? DEFAULT_WATCH_REGION,
    isResolved: region !== null,
    setRegion,
    isSaving: saveRegionMutation.isPending,
  };
}

export function useWatchProviderRegions(enabled = true) {
  return useQuery<ApiTypes.WatchProviderRegion[]>({
    queryKey: ["watchProviderRegions"],
    queryFn: () =>
      api
        .get<ApiTypes.GetWatchProviderRegionsResponse>(apiEndpoints.getWatchProviderRegions)
        .then(({ data }) => data.regions),
    staleTime: Infinity,
    enabled,
  });
}

export function useWatchProviders(mediaType: WatchMediaType, slug: string, region: string, enabled = true) {
  const endpoint = mediaType === "movie" ? apiEndpoints.getMovieWatchProviders : apiEndpoints.getTvShowWatchProviders;

  return useQuery<ApiTypes.WatchProviders>({
    queryKey: ["watchProviders", mediaType, slug, region],
    queryFn: () =>
      api
        .get<ApiTypes.GetWatchProvidersResponse>(endpoint(slug), { params: { region } })
        .then(({ data }) => data.watchProviders),
    enabled: enabled && !!slug && !!region,
  });
}
