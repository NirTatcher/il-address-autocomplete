import { readFile, writeFile } from "node:fs/promises";
import type { BuiltCity } from "../src/types.ts";
import { CHANGELOG_PATH, SYNC_SUMMARY_PATH } from "./utils.ts";

const MAX_LISTED = 40;

export type PreviousBuiltState = {
  cities: BuiltCity[];
  streetCountByCity: Record<string, number>;
  uniqueStreetCount: number;
};

export type SyncSummaryInput = {
  previous: PreviousBuiltState | null;
  nextCities: BuiltCity[];
  nextStreetCountByCity: Record<string, number>;
  nextUniqueStreetCount: number;
  generatedAtDate: string;
};

function formatCountChange(
  label: string,
  before: number | null,
  after: number,
): string {
  if (before == null) return `- ${label}: ${after} (initial)`;
  if (before === after) return `- ${label}: ${after} (unchanged)`;
  const delta = after - before;
  const signed = delta > 0 ? `+${delta}` : String(delta);
  return `- ${label}: ${before} → ${after} (${signed})`;
}

function cityLabel(code: number, byCode: Map<number, BuiltCity>): string {
  const city = byCode.get(code);
  if (!city?.nameHe) return String(code);
  return city.nameEn
    ? `${code} ${city.nameHe} / ${city.nameEn}`
    : `${code} ${city.nameHe}`;
}

function formatLimitedList(lines: string[]): string[] {
  if (lines.length <= MAX_LISTED) return lines;
  const hidden = lines.length - MAX_LISTED;
  return [...lines.slice(0, MAX_LISTED), `- …and ${hidden} more`];
}

function buildCityNameMap(
  previous: PreviousBuiltState | null,
  nextCities: BuiltCity[],
): Map<number, BuiltCity> {
  const byCode = new Map<number, BuiltCity>();
  for (const city of previous?.cities ?? []) byCode.set(city.code, city);
  for (const city of nextCities) byCode.set(city.code, city);
  return byCode;
}

/** Markdown bullets describing what changed (no heading). */
export function buildSyncChangeBullets(input: SyncSummaryInput): string {
  const { previous, nextCities, nextStreetCountByCity, nextUniqueStreetCount } =
    input;
  const byCode = buildCityNameMap(previous, nextCities);

  const prevCityCodes = new Set((previous?.cities ?? []).map((c) => c.code));
  const nextCityCodes = new Set(nextCities.map((c) => c.code));
  const prevStreetCodes = new Set(
    Object.keys(previous?.streetCountByCity ?? {}).map(Number),
  );
  const nextStreetCodes = new Set(
    Object.keys(nextStreetCountByCity).map(Number),
  );

  const citiesAdded = [...nextCityCodes]
    .filter((code) => !prevCityCodes.has(code))
    .sort((a, b) => a - b);
  const citiesRemoved = [...prevCityCodes]
    .filter((code) => !nextCityCodes.has(code))
    .sort((a, b) => a - b);

  const gainedStreets = [...nextStreetCodes]
    .filter((code) => !prevStreetCodes.has(code))
    .sort((a, b) => a - b);
  const lostStreets = [...prevStreetCodes]
    .filter((code) => !nextStreetCodes.has(code))
    .sort((a, b) => a - b);

  const countChanges: { code: number; before: number; after: number }[] = [];
  for (const code of nextStreetCodes) {
    if (!prevStreetCodes.has(code)) continue;
    const before = previous!.streetCountByCity[String(code)] ?? 0;
    const after = nextStreetCountByCity[String(code)] ?? 0;
    if (before !== after) countChanges.push({ code, before, after });
  }
  countChanges.sort(
    (a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before),
  );

  const lines: string[] = [
    formatCountChange(
      "Cities",
      previous?.cities.length ?? null,
      nextCities.length,
    ),
    formatCountChange(
      "Unique streets",
      previous?.uniqueStreetCount ?? null,
      nextUniqueStreetCount,
    ),
    formatCountChange(
      "Cities with street files",
      previous ? Object.keys(previous.streetCountByCity).length : null,
      Object.keys(nextStreetCountByCity).length,
    ),
  ];

  if (citiesAdded.length > 0) {
    lines.push("", `### Cities added (${citiesAdded.length})`);
    lines.push(
      ...formatLimitedList(
        citiesAdded.map((code) => `- ${cityLabel(code, byCode)}`),
      ),
    );
  }

  if (citiesRemoved.length > 0) {
    lines.push("", `### Cities removed (${citiesRemoved.length})`);
    lines.push(
      ...formatLimitedList(
        citiesRemoved.map((code) => `- ${cityLabel(code, byCode)}`),
      ),
    );
  }

  if (gainedStreets.length > 0) {
    lines.push(
      "",
      `### Cities that gained streets (${gainedStreets.length})`,
    );
    lines.push(
      ...formatLimitedList(
        gainedStreets.map((code) => {
          const count = nextStreetCountByCity[String(code)] ?? 0;
          return `- ${cityLabel(code, byCode)} (+${count})`;
        }),
      ),
    );
  }

  if (lostStreets.length > 0) {
    lines.push("", `### Cities that lost all streets (${lostStreets.length})`);
    lines.push(
      ...formatLimitedList(
        lostStreets.map((code) => {
          const before = previous?.streetCountByCity[String(code)] ?? 0;
          return `- ${cityLabel(code, byCode)} (was ${before})`;
        }),
      ),
    );
  }

  if (countChanges.length > 0) {
    lines.push(
      "",
      `### Street count changes in existing cities (${countChanges.length})`,
    );
    lines.push(
      ...formatLimitedList(
        countChanges.map(({ code, before, after }) => {
          const delta = after - before;
          const signed = delta > 0 ? `+${delta}` : String(delta);
          return `- ${cityLabel(code, byCode)}: ${before} → ${after} (${signed})`;
        }),
      ),
    );
  }

  if (
    previous != null &&
    citiesAdded.length === 0 &&
    citiesRemoved.length === 0 &&
    gainedStreets.length === 0 &&
    lostStreets.length === 0 &&
    countChanges.length === 0
  ) {
    lines.push(
      "",
      "_Content fingerprint changed (e.g. renamed streets/aliases) without net count shifts._",
    );
  }

  return lines.join("\n");
}

export function buildPrBody(input: SyncSummaryInput, bullets: string): string {
  return [
    "Automated weekly sync from [data.gov.il](https://data.gov.il).",
    "",
    `## Data sync ${input.generatedAtDate}`,
    "",
    bullets,
    "",
    "### Review",
    "",
    "- [ ] Review city/street count changes in `packages/data/manifest.json`",
    "- [ ] Skim `packages/data/CHANGELOG.md` entry",
    "- [ ] CI passes",
    "",
  ].join("\n");
}

export async function writeSyncSummaryFiles(
  input: SyncSummaryInput,
): Promise<void> {
  const bullets = buildSyncChangeBullets(input);
  await writeFile(SYNC_SUMMARY_PATH, buildPrBody(input, bullets), "utf8");
  await prependChangelogEntry(input.generatedAtDate, bullets);
}

async function prependChangelogEntry(
  date: string,
  bullets: string,
): Promise<void> {
  const entry = `## ${date}\n\n${bullets}\n`;
  const header = [
    "# Data changelog",
    "",
    "Automated entries from the weekly [data.gov.il](https://data.gov.il) sync. Newest first.",
    "",
  ].join("\n");

  let existing = "";
  try {
    existing = await readFile(CHANGELOG_PATH, "utf8");
  } catch {
    await writeFile(CHANGELOG_PATH, `${header}${entry}`);
    return;
  }

  const marker = "\n## ";
  const idx = existing.indexOf(marker);
  const next =
    idx === -1
      ? `${existing.trimEnd()}\n\n${entry}`
      : `${existing.slice(0, idx + 1)}${entry}\n${existing.slice(idx + 1)}`;

  await writeFile(CHANGELOG_PATH, next, "utf8");
}
