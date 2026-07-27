const NIKUD_RANGE = /[\u0591-\u05C7]/g;
const FINAL_LETTER_MAP: Record<string, string> = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};

export function normalizeHebrew(value: string): string {
  return value
    .normalize("NFKC")
    .replace(NIKUD_RANGE, "")
    .replace(/[\u05F3\u05F4'"]/g, "")
    .replace(/[-\s]+/g, " ")
    .trim()
    .split("")
    .map((char) => FINAL_LETTER_MAP[char] ?? char)
    .join("")
    .toLowerCase();
}

export function getSearchKeys(nameHe: string, aliases: string[] = []): string[] {
  const keys = new Set<string>();
  const primary = normalizeHebrew(nameHe);
  if (primary) keys.add(primary);

  for (const alias of aliases) {
    const normalized = normalizeHebrew(alias);
    if (normalized) keys.add(normalized);
  }

  return [...keys];
}
