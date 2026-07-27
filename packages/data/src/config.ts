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
