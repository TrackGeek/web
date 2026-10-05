import { useMutation, useQuery } from "@tanstack/react-query";
import type { ApiTypes } from "@/lib/api";
import { api } from "@/lib/api";

export interface AnilistSnapshot {
  schemaVersion: number;
  source: "anilist";
  exportedAt: string;
  access: "public";
  imported: false;
  snapshotId: string;
  user: { id: number; name: string } & Record<string, unknown>;
  counts: { anime: number; manga: number; total: number };
  entries: Record<string, unknown>[];
  collections: Record<string, unknown>;
}

export interface AnilistImportReport {
  total: number;
  imported: number;
  skipped: number;
  unmatched: number;
  failed: number;
  items: { mediaId: number; name: string; state: string; reason?: string; warnings?: string[] }[];
}

export interface AnilistImportStatus {
  jobId: string;
  state: string;
  report: AnilistImportReport;
  entries?: { mediaId: number; name: string; status?: ApiTypes.ProgressStatus }[];
}

export async function getAnilistFailures(jobId: string) {
  const { data } = await api.get<{ items: Record<string, unknown>[] }>(`/import/anilist/jobs/${jobId}/failures`);
  return data.items;
}

export function useStartAnilistImport() {
  return useMutation({
    mutationFn: async (snapshotId: string) => {
      const { data } = await api.post<{ jobId: string }>("/import/anilist/jobs", { snapshotId });
      return data;
    },
    retry: false,
  });
}

export function useAnilistImportStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["anilist-import", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const { data } = await api.get<AnilistImportStatus>(`/import/anilist/jobs/${jobId}`);
      return data;
    },
    refetchInterval: (query) => (["completed", "failed"].includes(query.state.data?.state ?? "") ? false : 2000),
    retry: false,
  });
}

export function useAnilistSnapshot() {
  return useMutation({
    mutationFn: async ({ username, signal }: { username: string; signal: AbortSignal }) => {
      const { data } = await api.get<AnilistSnapshot>("/import/anilist/snapshot", {
        params: { username },
        signal,
      });

      return data;
    },
    retry: false,
    gcTime: 0,
  });
}
