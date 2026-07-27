import { writeFile } from "node:fs/promises";
import path from "node:path";
import { CKAN_BASE, FETCH_BATCH_SIZE, RESOURCES } from "../src/config.ts";
import type {
  CkanDatastoreSearchResult,
  CkanResourceShowResult,
  RawCityRecord,
  RawStreetRecord,
} from "../src/types.ts";
import { ensureDir, RAW_DIR, writeJsonFile } from "./utils.ts";

interface CkanResponse<T> {
  success: boolean;
  result: T;
}

async function ckanGet<T>(action: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${CKAN_BASE}/${action}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CKAN request failed (${response.status}): ${url}`);
  }

  const data = (await response.json()) as CkanResponse<T>;
  if (!data.success) {
    throw new Error(`CKAN action ${action} returned success=false`);
  }

  return data.result;
}

async function fetchAllRecords<T>(resourceId: string): Promise<{
  records: T[];
  total: number;
  meta: CkanResourceShowResult;
}> {
  const meta = await ckanGet<CkanResourceShowResult>("resource_show", {
    id: resourceId,
  });

  const records: T[] = [];
  let offset = 0;
  let total = 0;

  while (true) {
    const result = await ckanGet<CkanDatastoreSearchResult<T>>("datastore_search", {
      resource_id: resourceId,
      limit: String(FETCH_BATCH_SIZE),
      offset: String(offset),
    });

    if (total === 0) {
      total = result.total;
      console.log(`  total records: ${total}`);
    }

    if (result.records.length === 0) break;

    records.push(...result.records);
    offset += result.records.length;

    process.stdout.write(`\r  fetched ${records.length}/${total}`);

    if (records.length >= total) break;
  }

  process.stdout.write("\n");
  return { records, total, meta };
}

async function main(): Promise<void> {
  await ensureDir(RAW_DIR);

  console.log("Fetching cities from data.gov.il...");
  const cities = await fetchAllRecords<RawCityRecord>(RESOURCES.cities.id);
  const citiesPath = path.join(RAW_DIR, "cities.json");
  await writeJsonFile(citiesPath, cities.records);
  await writeFile(
    path.join(RAW_DIR, "cities.meta.json"),
    `${JSON.stringify(
      {
        resourceId: RESOURCES.cities.id,
        lastModified: cities.meta.last_modified,
        recordCount: cities.total,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`  wrote ${citiesPath}`);

  console.log("Fetching streets from data.gov.il...");
  const streets = await fetchAllRecords<RawStreetRecord>(RESOURCES.streets.id);
  const streetsPath = path.join(RAW_DIR, "streets.json");
  await writeJsonFile(streetsPath, streets.records);
  await writeFile(
    path.join(RAW_DIR, "streets.meta.json"),
    `${JSON.stringify(
      {
        resourceId: RESOURCES.streets.id,
        lastModified: streets.meta.last_modified,
        recordCount: streets.total,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`  wrote ${streetsPath}`);
  console.log("Done.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
