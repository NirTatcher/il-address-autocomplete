export const CKAN_BASE = "https://data.gov.il/api/3/action";

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

export const FETCH_BATCH_SIZE = 500;

/** Pause between successful datastore pages to ease load on data.gov.il */
export const FETCH_PAGE_DELAY_MS = 150;

/** Retries for transient CKAN failures (502/503/504, network errors) */
export const FETCH_MAX_ATTEMPTS = 5;

/** Base delay for exponential backoff: 1s, 2s, 4s, 8s… */
export const FETCH_RETRY_BASE_MS = 1000;
