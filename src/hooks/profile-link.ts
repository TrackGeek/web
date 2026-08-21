import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiEndpoints } from "@/lib/api.ts";

export interface ProfileLinkRequest {
  label: string;
  url: string;
}

export function useCreateProfileLink(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProfileLinkRequest) => api.post(apiEndpoints.createProfileLink, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}

export function useUpdateProfileLink(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId, ...body }: ProfileLinkRequest & { linkId: string }) =>
      api.patch(apiEndpoints.updateProfileLink(linkId), body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}

export function useDeleteProfileLink(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => api.delete(apiEndpoints.deleteProfileLink(linkId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}

export function useReorderProfileLinks(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkIds: string[]) => api.patch(apiEndpoints.reorderProfileLinks, { linkIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}
