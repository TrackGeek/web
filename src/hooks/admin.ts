import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 20;
const MESSAGES_PER_PAGE = 50;

type AdminMessagesData = InfiniteData<ApiTypes.GetAdminChatMessagesResponse, string | undefined>;

export function adminConversationsQueryKey(search?: string) {
  return ["admin", "chat", "conversations", search];
}

export function adminMessagesQueryKey(conversationId: string) {
  return ["admin", "chat", "messages", conversationId];
}

export function patchAdminMessageInCache(queryClient: QueryClient, message: ApiTypes.AdminChatMessage) {
  queryClient.setQueryData<AdminMessagesData>(adminMessagesQueryKey(message.conversationId), (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            messages: {
              ...page.messages,
              items: page.messages.items.map((item) => (item.id === message.id ? message : item)),
            },
          })),
        }
      : data,
  );
}

export function adminReportsQueryKey(status?: string, targetType?: string) {
  return ["admin", "reports", status, targetType];
}

export function useAdminConversations(search: string) {
  return useInfiniteQuery({
    queryKey: adminConversationsQueryKey(search),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetAdminChatConversationsResponse>(apiEndpoints.getAdminChatConversations, {
          params: { search: search || undefined, page: pageParam, itemsPerPage: ITEMS_PER_PAGE },
        })
        .then(({ data }) => data.conversations),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}

export function useAdminMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: adminMessagesQueryKey(conversationId),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetAdminChatMessagesResponse>(apiEndpoints.getAdminChatMessages(conversationId), {
          params: { cursor: pageParam, limit: MESSAGES_PER_PAGE },
        })
        .then(({ data }) => data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.messages.hasNextPage ? (lastPage.messages.nextCursor ?? undefined) : undefined,
  });
}

export function useAdminDeleteMessage(conversationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => api.delete(apiEndpoints.adminDeleteChatMessage(messageId)),
    onSuccess: (_, messageId) => {
      if (conversationId) {
        queryClient.setQueryData<AdminMessagesData>(adminMessagesQueryKey(conversationId), (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  messages: {
                    ...page.messages,
                    items: page.messages.items.map((item) =>
                      item.id === messageId
                        ? { ...item, deletedAt: new Date().toISOString(), deletedBy: "Admin" as const }
                        : item,
                    ),
                  },
                })),
              }
            : data,
        );
      }

      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}

export interface AdminReportsFilters {
  status?: ApiTypes.ReportStatus;
  targetType?: ApiTypes.ReportTargetType;
}

export function useAdminReports({ status, targetType }: AdminReportsFilters) {
  return useInfiniteQuery({
    queryKey: adminReportsQueryKey(status, targetType),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetAdminReportsResponse>(apiEndpoints.getAdminReports, {
          params: { status, targetType, page: pageParam, itemsPerPage: ITEMS_PER_PAGE },
        })
        .then(({ data }) => data.reports),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}

export function useUpdateAdminReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, ...input }: ApiTypes.UpdateReportInput & { reportId: string }) =>
      api.patch(apiEndpoints.updateAdminReport(reportId), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });
}

export function useAdminDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => api.delete(apiEndpoints.adminDeleteComment(commentId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments"] }),
  });
}
