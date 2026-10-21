import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api, apiEndpoints } from "@/lib/api";
import { apiErrorMessage } from "@/lib/utils/api-error";
import { containsBook } from "@/utils/contains-book";

export function useBookCover(hardcoverId: number) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (editionId: number | null) =>
      editionId == null
        ? api.delete(apiEndpoints.bookCover(hardcoverId))
        : api.put(apiEndpoints.bookCover(hardcoverId), { editionId }),
    onSuccess: async () => {
      await queryClient.cancelQueries({ predicate: (query) => containsBook(query.state.data, hardcoverId) });
      await Promise.all([
        queryClient.invalidateQueries({ predicate: (query) => containsBook(query.state.data, hardcoverId) }),
        router.invalidate(),
      ]);
      toast.success(t("library:coverUpdated"));
    },
    onError: (error) => toast.error(apiErrorMessage(t, error)),
  });
}
