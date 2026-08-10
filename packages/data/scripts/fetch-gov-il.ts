import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CKAN_BASE,
  FETCH_BATCH_SIZE,
  FETCH_MAX_ATTEMPTS,
  FETCH_PAGE_DELAY_MS,
  FETCH_RETRY_BASE_MS,
  RESOURCES,
} from "../src/config.ts";
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(attempt: number): number {
  // attempt 1 → 1s, 2 → 2s, 3 → 4s… plus small jitter
  const base = FETCH_RETRY_BASE_MS * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message;
  if (/CKAN request failed \((502|503|504)\)/.test(message)) return true;
  if (error.name === "AbortError" || error.name === "TimeoutError") return true;
  if (/fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket/i.test(message)) return true;
  return false;
}

async function ckanGetOnce<T>(action: string, params: Record<string, string>): Promise<T> {
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

async function ckanGet<T>(action: string, params: Record<string, string>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt++) {
    try {
      return await ckanGetOnce<T>(action, params);
    } catch (error) {
      lastError = error;
      const retryable = isRetryableError(error);
      if (!retryable || attempt === FETCH_MAX_ATTEMPTS) {
        throw error;
      }

      const delay = retryDelayMs(attempt);
      const statusMatch =
        error instanceof Error
          ? error.message.match(/CKAN request failed \((\d+)\)/)
          : null;
      const label = statusMatch?.[1]
        ? `HTTP ${statusMatch[1]}`
        : error instanceof Error
          ? error.message
          : "unknown error";

      console.warn(
        `\n  retry ${attempt}/${FETCH_MAX_ATTEMPTS} for ${action}` +
          (params.offset != null ? ` offset=${params.offset}` : "") +
          ` after ${label}; waiting ${delay}ms`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
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

    if (FETCH_PAGE_DELAY_MS > 0) {
      await sleep(FETCH_PAGE_DELAY_MS);
    }
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
