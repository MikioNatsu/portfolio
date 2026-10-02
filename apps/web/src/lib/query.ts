import type { QueryClient, QueryKey } from '@tanstack/react-query';
import type { Paginated } from '@natsu/types';

export type QuerySnapshot = Array<[QueryKey, unknown]>;

/**
 * Optimistically patch one record across every cached page under `queryKey`
 * (any filters / page numbers). Returns a snapshot for `restoreQueries`.
 */
export async function patchPaginatedItem<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string,
  patch: Partial<T>,
): Promise<QuerySnapshot> {
  await queryClient.cancelQueries({ queryKey });
  const snapshot = queryClient.getQueriesData({ queryKey });
  queryClient.setQueriesData<Paginated<T>>({ queryKey }, (current) =>
    current && Array.isArray(current.items)
      ? {
          ...current,
          items: current.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        }
      : current,
  );
  return snapshot;
}

/** Roll back an optimistic update. */
export function restoreQueries(queryClient: QueryClient, snapshot: QuerySnapshot | undefined) {
  snapshot?.forEach(([key, data]) => queryClient.setQueryData<unknown>(key, data));
}
