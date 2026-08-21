import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { JobSearchValues } from "../schemas/search";

export function useJobSearch(values: JobSearchValues, enabled = false) {
  return useQuery({
    queryKey: ["jobs", values],
    queryFn: async () => {
      const response = await api.get("/jobs", { params: values });
      return response.data;
    },
    enabled,
  });
}