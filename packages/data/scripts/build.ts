import path from "node:path";
import { writeFile } from "node:fs/promises";
import type {
  BuiltCity,
  BuiltStreet,
  DataManifest,
  RawCityRecord,
  RawStreetRecord,
  SourceMeta,
} from "../src/types.ts";
import {
  ensureDir,
  GENERATED_DIR,
  MANIFEST_PATH,
  parseIntField,
  RAW_DIR,
  readJsonFile,
  sha256,
  STREETS_DIR,
  trimOrNull,
  writeJsonFile,
} from "./utils.ts";

function transformCity(record: RawCityRecord): BuiltCity {
  return {
    code: parseIntField(record.city_code),
    nameHe: trimOrNull(record.city_name_he) ?? "",
    nameEn: trimOrNull(record.city_name_en),
    regionCode: parseIntField(record.region_code),
    regionName: trimOrNull(record.region_name) ?? "",
  };
}

function isOfficialStatus(status: string): boolean {
  return status.trim().toLowerCase().startsWith("official");
}

function buildStreetsByCity(records: RawStreetRecord[]): Map<number, BuiltStreet[]> {
  const grouped = new Map<
    number,
    Map<number, { officialName: string | null; aliases: Set<string> }>
  >();

  for (const record of records) {
    const cityCode = parseIntField(record.city_code);
    const officialCode = parseIntField(record.official_code);
    const streetName = trimOrNull(record.street_name);
    if (!streetName || Number.isNaN(cityCode) || Number.isNaN(officialCode)) continue;

    let cityStreets = grouped.get(cityCode);
    if (!cityStreets) {
      cityStreets = new Map();
      grouped.set(cityCode, cityStreets);
    }

    let street = cityStreets.get(officialCode);
    if (!street) {
      street = { officialName: null, aliases: new Set() };
      cityStreets.set(officialCode, street);
    }

    if (isOfficialStatus(record.street_name_status)) {
      street.officialName = streetName;
    } else {
      street.aliases.add(streetName);
    }
  }

  const result = new Map<number, BuiltStreet[]>();

  for (const [cityCode, cityStreets] of grouped) {
    const streets: BuiltStreet[] = [];

    for (const [officialCode, data] of cityStreets) {
      const nameHe = data.officialName ?? [...data.aliases][0];
      if (!nameHe) continue;

      const aliases = [...data.aliases].filter((alias) => alias !== nameHe).sort();
      streets.push({
        code: officialCode,
        nameHe,
        aliases,
      });
    }

    streets.sort((a, b) => a.nameHe.localeCompare(b.nameHe, "he"));
    result.set(cityCode, streets);
  }

  return result;
}

async function loadSourceMeta(
  dataset: "cities" | "streets",
  recordCount: number,
): Promise<SourceMeta> {
  const metaPath = path.join(RAW_DIR, `${dataset}.meta.json`);
  try {
    const meta = await readJsonFile<SourceMeta>(metaPath);
    return { ...meta, recordCount };
  } catch {
    return {
      resourceId: dataset === "cities"
        ? "8f714b6f-c35c-4b40-a0e7-547b675eee0e"
        : "bf185c7f-1a4e-4662-88c5-fa118a244bda",
      lastModified: new Date().toISOString(),
      recordCount,
    };
  }
}

async function main(): Promise<void> {
  const citiesPath = path.join(RAW_DIR, "cities.json");
  const streetsPath = path.join(RAW_DIR, "streets.json");

  console.log("Building generated data...");
  const rawCities = await readJsonFile<RawCityRecord[]>(citiesPath);
  const rawStreets = await readJsonFile<RawStreetRecord[]>(streetsPath);

  const cities = rawCities
    .map(transformCity)
    .filter((city) => city.nameHe)
    .sort((a, b) => a.nameHe.localeCompare(b.nameHe, "he"));

  const streetsByCity = buildStreetsByCity(rawStreets);

  await ensureDir(GENERATED_DIR);
  await ensureDir(STREETS_DIR);

  await writeJsonFile(path.join(GENERATED_DIR, "cities.json"), cities);

  const streetCountByCity: Record<string, number> = {};
  let uniqueStreetCount = 0;

  for (const [cityCode, streets] of streetsByCity) {
    const fileName = `${cityCode}.json`;
    await writeJsonFile(path.join(STREETS_DIR, fileName), streets);
    streetCountByCity[String(cityCode)] = streets.length;
    uniqueStreetCount += streets.length;
  }

  const manifest: DataManifest = {
    sources: {
      cities: await loadSourceMeta("cities", rawCities.length),
      streets: await loadSourceMeta("streets", rawStreets.length),
    },
    built: {
      cityCount: cities.length,
      uniqueStreetCount,
      rawStreetRecordCount: rawStreets.length,
      streetCountByCity,
      generatedAt: new Date().toISOString(),
    },
  };

  await writeJsonFile(MANIFEST_PATH, manifest);

  const cityCodes = [...streetsByCity.keys()].sort((a, b) => a - b);
  const loaderEntries = cityCodes.map(
    (cityCode) => `  ${cityCode}: () => import("./streets/${cityCode}.json"),`,
  );

  const loaderJs = [
    `const loaders = {`,
    ...loaderEntries,
    `};`,
    ``,
    `export async function loadStreetsForCity(cityCode) {`,
    `  const loader = loaders[cityCode];`,
    `  if (!loader) return [];`,
    `  const module = await loader();`,
    `  return module.default;`,
    `}`,
    ``,
    `export function getAvailableCityCodes() {`,
    `  return Object.keys(loaders).map(Number);`,
    `}`,
    ``,
  ].join("\n");

  const loaderDts = [
    `export interface BuiltStreet {`,
    `  code: number;`,
    `  nameHe: string;`,
    `  aliases: string[];`,
    `}`,
    ``,
    `export declare function loadStreetsForCity(cityCode: number): Promise<BuiltStreet[]>;`,
    `export declare function getAvailableCityCodes(): number[];`,
    ``,
  ].join("\n");

  await writeFile(path.join(GENERATED_DIR, "street-loader.js"), loaderJs, "utf8");
  await writeFile(path.join(GENERATED_DIR, "street-loader.d.ts"), loaderDts, "utf8");

  const citiesChecksum = sha256(JSON.stringify(cities));
  console.log(`  cities: ${cities.length} (${citiesChecksum.slice(0, 8)}…)`);
  console.log(`  streets: ${uniqueStreetCount} unique across ${streetsByCity.size} cities`);
  console.log(`  manifest: ${MANIFEST_PATH}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
