import { CKAN_BASE, RESOURCES } from "../src/config.ts";
import type { CkanDatastoreSearchResult, CkanResourceShowResult, DataManifest } from "../src/types.ts";
import { MANIFEST_PATH, readJsonFile } from "./utils.ts";

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
    throw new Error(`CKAN request failed (${response.status})`);
  }

  const data = (await response.json()) as CkanResponse<T>;
  if (!data.success) {
    throw new Error(`CKAN action ${action} failed`);
  }

  return data.result;
}

const ANCHOR_CHECKS = [
  { cityCode: 5000, minStreets: 2700, label: "Tel Aviv" },
  { cityCode: 3000, minStreets: 4300, label: "Jerusalem" },
  { cityCode: 4000, minStreets: 1000, label: "Haifa" },
] as const;

async function main(): Promise<void> {
  const manifest = await readJsonFile<DataManifest>(MANIFEST_PATH);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, resource] of Object.entries(RESOURCES)) {
    const sourceKey = key as keyof DataManifest["sources"];
    const local = manifest.sources[sourceKey];

    try {
      const remote = await ckanGet<CkanResourceShowResult>("resource_show", {
        id: resource.id,
      });
      const search = await ckanGet<CkanDatastoreSearchResult<unknown>>("datastore_search", {
        resource_id: resource.id,
        limit: "0",
      });

      if (remote.last_modified > local.lastModified) {
        warnings.push(
          `${resource.name}: CKAN updated (${remote.last_modified}) after local build (${local.lastModified})`,
        );
      }

      if (search.total !== local.recordCount) {
        errors.push(
          `${resource.name}: record count mismatch (local ${local.recordCount}, CKAN ${search.total})`,
        );
      }
    } catch (error) {
      warnings.push(`${resource.name}: could not reach CKAN (${String(error)})`);
    }
  }

  for (const check of ANCHOR_CHECKS) {
    if (manifest.built.cityCount < 100) {
      warnings.push("Skipping anchor city checks (sample dataset detected)");
      break;
    }

    const count = manifest.built.streetCountByCity[String(check.cityCode)] ?? 0;
    if (count < check.minStreets) {
      errors.push(`${check.label} (${check.cityCode}): expected ≥${check.minStreets} streets, got ${count}`);
    }
  }

  if (warnings.length > 0) {
    console.warn("Warnings:");
    for (const warning of warnings) console.warn(`  - ${warning}`);
  }

  if (errors.length > 0) {
    console.error("Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("Data validation passed.");
  console.log(`  cities: ${manifest.built.cityCount}`);
  console.log(`  unique streets: ${manifest.built.uniqueStreetCount}`);
  console.log(`  generated: ${manifest.built.generatedAt}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
