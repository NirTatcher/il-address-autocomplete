import { loadStreetsForCity } from "@il-address/data/loader";
import manifestData from "@il-address/data/manifest.json";
import type { DataManifest, Street } from "./types.js";

const manifest = manifestData as DataManifest;

const streetCache = new Map<number, Street[]>();

export function hasStreets(cityCode: number): boolean {
  return Boolean(manifest.built.streetCountByCity[String(cityCode)]);
}

export function getStreetCount(cityCode: number): number {
  return manifest.built.streetCountByCity[String(cityCode)] ?? 0;
}

export async function loadStreets(cityCode: number): Promise<Street[]> {
  const cached = streetCache.get(cityCode);
  if (cached) return cached;

  if (!hasStreets(cityCode)) return [];

  const streets = await loadStreetsForCity(cityCode);
  streetCache.set(cityCode, streets);
  return streets;
}

export function clearStreetCache(): void {
  streetCache.clear();
}
