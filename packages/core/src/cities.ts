import citiesData from "@il-address/data/cities.json";
import manifestData from "@il-address/data/manifest.json";
import { searchItems } from "./search.js";
import type { City, DataManifest, SearchOptions } from "./types.js";

const cities = citiesData as City[];
const manifest = manifestData as DataManifest;

const cityByCode = new Map(cities.map((city) => [city.code, city]));

export function getCities(): City[] {
  return cities;
}

export function getCityByCode(code: number): City | undefined {
  return cityByCode.get(code);
}

export function getCityCount(): number {
  return cities.length;
}

export function searchCities(query: string, options?: SearchOptions): City[] {
  return searchItems(cities, query, options);
}

export function getDataManifest(): DataManifest {
  return manifest;
}
