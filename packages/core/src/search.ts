import { getSearchKeys, normalizeHebrew } from "./normalize.js";
import type { SearchOptions } from "./types.js";

export const DEFAULT_SEARCH_LIMIT = 10;
export const DEFAULT_MIN_QUERY_LENGTH = 1;

interface SearchableItem {
  nameHe: string;
  aliases?: string[];
  nameEn?: string | null;
}

function scoreMatch(query: string, keys: string[], nameEn: string | null | undefined): number {
  let best = Number.POSITIVE_INFINITY;

  for (const key of keys) {
    if (key === query) best = Math.min(best, 0);
    else if (key.startsWith(query)) best = Math.min(best, 1);
    else if (key.includes(query)) best = Math.min(best, 2);
  }

  if (nameEn) {
    const english = nameEn.toLowerCase();
    if (english === query) best = Math.min(best, 0);
    else if (english.startsWith(query)) best = Math.min(best, 1);
    else if (english.includes(query)) best = Math.min(best, 3);
  }

  return best;
}

export function searchItems<T extends SearchableItem>(
  items: T[],
  query: string,
  options: SearchOptions = {},
): T[] {
  const limit = options.limit ?? DEFAULT_SEARCH_LIMIT;
  const minQueryLength = options.minQueryLength ?? DEFAULT_MIN_QUERY_LENGTH;
  const trimmed = query.trim();

  if (trimmed.length < minQueryLength) return [];

  const normalizedQuery = normalizeHebrew(trimmed);
  const englishQuery = trimmed.toLowerCase();
  const useEnglish = /[a-z]/i.test(trimmed);

  const ranked = items
    .map((item) => {
      const keys = getSearchKeys(item.nameHe, item.aliases);
      const score = scoreMatch(
        useEnglish ? englishQuery : normalizedQuery,
        keys,
        item.nameEn,
      );
      return { item, score };
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.item.nameHe.localeCompare(b.item.nameHe, "he");
    });

  return ranked.slice(0, limit).map(({ item }) => item);
}
