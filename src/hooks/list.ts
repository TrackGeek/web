import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { buildRemoveItemRequest } from "@/lib/utils/list-item";

const ITEMS_PER_PAGE = 18;

export function listsQueryKey(userId: string) {
  return ["lists", userId];
}

export function useLists(userId: string, query?: string) {
  const trimmedQuery = query?.trim() || undefined;

  return useInfiniteQuery({
    queryKey: [...listsQueryKey(userId), trimmedQuery],
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId), {
          params: { page: pageParam, itemsPerPage: ITEMS_PER_PAGE, ...(trimmedQuery && { query: trimmedQuery }) },
        })
        .then(({ data }) => data.lists),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}

export function useUpdateList(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ApiTypes.UpdateListRequest) => api.patch(apiEndpoints.updateList(listId), body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] }),
  });
}

export function useDeleteList(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete(apiEndpoints.deleteList(listId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] }),
  });
}

export function useRemoveItemFromList(list: ApiTypes.List) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: ApiTypes.ListItem) => {
      const body = buildRemoveItemRequest(list, item);

      if (!body) {
        return Promise.reject(new Error("Item has no entity matching the list type"));
      }

      return api.delete(apiEndpoints.listItem(list.id), { data: body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listItems", list.id] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}
