import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

const sameOrder = (a: Array<{ id: string }>, b: Array<{ id: string }>) =>
  a.length === b.length && a.every((item, index) => item.id === b[index]?.id);

/**
 * Local, instantly-updating order for a drag-sortable list backed by a query.
 * Committing persists optimistically and rolls back if the server refuses.
 */
export function useReorderableList<T extends { id: string }>({
  queryKey,
  items,
  persist,
  onError,
  onSettled,
}: {
  queryKey: QueryKey;
  items: T[] | undefined;
  persist: (ids: string[]) => Promise<unknown>;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}) {
  const queryClient = useQueryClient();
  const [ordered, setOrdered] = useState<T[]>(items ?? []);

  useEffect(() => setOrdered(items ?? []), [items]);

  const mutation = useMutation<unknown, unknown, T[], { previous: T[] | undefined }>({
    mutationFn: (next) => persist(next.map((item) => item.id)),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<T[]>(queryKey);
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (error, _next, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      setOrdered(context?.previous ?? []);
      onError?.(error);
    },
    onSettled,
  });

  const { mutate } = mutation;
  const commit = useCallback(
    (next: T[]) => {
      if (items && sameOrder(next, items)) return;
      mutate(next);
    },
    [items, mutate],
  );

  return { ordered, setOrdered, commit, saving: mutation.isPending };
}
