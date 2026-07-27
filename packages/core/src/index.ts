import { getCityByCode, getCities, getCityCount, getDataManifest, searchCities } from "./cities.js";
import { normalizeHebrew, getSearchKeys } from "./normalize.js";
import { searchItems, DEFAULT_MIN_QUERY_LENGTH, DEFAULT_SEARCH_LIMIT } from "./search.js";
import { clearStreetCache, getStreetCount, hasStreets, loadStreets } from "./streets.js";

export type {
  AddressSelection,
  City,
  DataManifest,
  SearchOptions,
  Street,
} from "./types.js";

export {
  clearStreetCache,
  DEFAULT_MIN_QUERY_LENGTH,
  DEFAULT_SEARCH_LIMIT,
  getCities,
  getCityByCode,
  getCityCount,
  getDataManifest,
  getSearchKeys,
  getStreetCount,
  hasStreets,
  loadStreets,
  normalizeHebrew,
  searchCities,
  searchItems,
};

export async function searchStreets(
  cityCode: number,
  query: string,
  options?: import("./types.js").SearchOptions,
) {
  const streets = await loadStreets(cityCode);
  return searchItems(streets, query, options);
}

export { getCityByCode as getCity };
