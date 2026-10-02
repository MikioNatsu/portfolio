export interface Searchable {
  label: string;
  group: string;
  keywords?: string[];
}

/** True when every character of `query` appears in `text`, in order. */
function isSubsequence(query: string, text: string): boolean {
  let position = 0;
  for (const char of text) {
    if (char === query[position]) position += 1;
    if (position === query.length) return true;
  }
  return false;
}

/** Relevance of one item for `query` (0 = no match). Higher is better. */
export function scoreItem(item: Searchable, query: string): number {
  const needle = query.trim().toLowerCase();
  if (!needle) return 1;

  const label = item.label.toLowerCase();
  if (label === needle) return 100;
  if (label.startsWith(needle)) return 80;
  if (label.split(/[\s/·-]+/).some((word) => word.startsWith(needle))) return 60;
  if (label.includes(needle)) return 45;

  const keywords = (item.keywords ?? []).map((keyword) => keyword.toLowerCase());
  if (keywords.some((keyword) => keyword.startsWith(needle))) return 35;
  if (keywords.some((keyword) => keyword.includes(needle))) return 25;
  if (needle.length >= 2 && isSubsequence(needle, label)) return 10;
  return 0;
}

/**
 * Ranks matches, then clusters them by group in order of each group's best
 * hit — so the strongest category leads, Spotlight-style.
 */
export function searchCommands<T extends Searchable>(
  items: T[],
  query: string,
  limit = 20,
): Array<{ group: string; items: T[] }> {
  const ranked = items
    .map((item, index) => ({ item, index, score: scoreItem(item, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit);

  const groups = new Map<string, T[]>();
  for (const { item } of ranked) {
    const bucket = groups.get(item.group);
    if (bucket) bucket.push(item);
    else groups.set(item.group, [item]);
  }
  return Array.from(groups, ([group, groupItems]) => ({ group, items: groupItems }));
}
