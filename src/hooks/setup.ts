import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

export interface SetupItemRequest {
  type?: ApiTypes.SetupItemType;
  name?: string;
  brand?: string;
  link?: string;
}

export function useAddSetupPhoto(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => api.post(apiEndpoints.addSetupPhoto, { url }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}

export function useDeleteSetupPhoto(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => api.delete(apiEndpoints.deleteSetupPhoto(photoId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}

export function useCreateSetupItem(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SetupItemRequest) => api.post(apiEndpoints.createSetupItem, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}

export function useUpdateSetupItem(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, ...body }: SetupItemRequest & { itemId: string }) =>
      api.patch(apiEndpoints.updateSetupItem(itemId), body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}

export function useReorderSetupItems(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemIds: string[]) => api.patch(apiEndpoints.reorderSetupItems, { itemIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}

export function useDeleteSetupItem(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => api.delete(apiEndpoints.deleteSetupItem(itemId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", username] }),
  });
}
