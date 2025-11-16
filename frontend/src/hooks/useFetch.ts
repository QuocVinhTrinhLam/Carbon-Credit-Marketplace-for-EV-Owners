import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const useFetch = <TQueryFnData, TError = unknown>(
  key: readonly unknown[],
  queryFn: () => Promise<TQueryFnData>,
  options?: Partial<
    UseQueryOptions<TQueryFnData, TError, TQueryFnData, readonly unknown[]>
  >
) => {
  return useQuery<TQueryFnData, TError, TQueryFnData>({
    queryKey: key,
    queryFn,
    staleTime: 1000 * 60,
    ...options
  });
};

