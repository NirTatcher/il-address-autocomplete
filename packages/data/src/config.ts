export const CKAN_BASE = "https://data.gov.il/api/3/action";

/**
 * data.gov.il WAF expects this UA (used by Hasadna / community clients).
 * Default Node `fetch` UA gets intermittent edge 404s from cloud IPs.
 */
export const CKAN_USER_AGENT = "datagov-external-client";

export const RESOURCES = {
  cities: {
    id: "8f714b6f-c35c-4b40-a0e7-547b675eee0e",
    name: "cities",
  },
  streets: {
    id: "bf185c7f-1a4e-4662-88c5-fa118a244bda",
    name: "streets-with-synonyms",
  },
} as const;

/** CKAN datastore_search hard-caps around 32k; keep at the cap to minimize pages. */
export const FETCH_BATCH_SIZE = 32_000;

/** Pause between successful datastore pages to ease load on data.gov.il */
export const FETCH_PAGE_DELAY_MS = 500;

/** Retries for transient CKAN failures (404/429/502/503/504, network errors) */
export const FETCH_MAX_ATTEMPTS = 6;

/** Base delay for exponential backoff: 2s, 4s, 8s, 16s… */
export const FETCH_RETRY_BASE_MS = 2000;
