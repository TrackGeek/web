import { useMutation } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

export function useCreateReport() {
  return useMutation({
    mutationFn: (input: ApiTypes.CreateReportInput) => api.post(apiEndpoints.createReport, input),
  });
}
