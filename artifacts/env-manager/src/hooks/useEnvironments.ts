
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, type EnvVar } from "@/lib/mockApi";

const QUERY_KEY = ["environments"];

export function useEnvironments() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => mockApi.listEnvironments(),
  });
}

export function useCreateEnvironment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      isBase: boolean;
      parentId: string | null;
      variables: EnvVar[];
    }) => mockApi.createEnvironment(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateEnvironment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<{ name: string; variables: EnvVar[] }>;
    }) => mockApi.updateEnvironment(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteEnvironment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockApi.deleteEnvironment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
