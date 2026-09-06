# @il-address/data

[![npm version](https://img.shields.io/npm/v/@il-address/data)](https://www.npmjs.com/package/@il-address/data)
[![cities](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FNirTatcher%2Fil-address-autocomplete%2Fmain%2Fpackages%2Fdata%2Fmanifest.json&query=%24.built.cityCount&label=cities&color=0ea5e9)](./manifest.json)
[![streets](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FNirTatcher%2Fil-address-autocomplete%2Fmain%2Fpackages%2Fdata%2Fmanifest.json&query=%24.built.uniqueStreetCount&label=streets&color=0ea5e9)](./manifest.json)
[![last gov.il change](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FNirTatcher%2Fil-address-autocomplete%2Fmain%2Fpackages%2Fdata%2Fmanifest.json&query=%24.built.generatedAtDate&label=last%20gov.il%20change&color=8b5cf6)](./manifest.json)

Israeli city and street data for `@il-address/core`. Typically installed automatically as a transitive dependency — you usually don't import this package directly.

Data is sourced from the official [data.gov.il](https://data.gov.il) CKAN API (Population & Immigration Authority / רשות האוכלוסין וההגירה).

## Official sources

| Dataset | CKAN resource ID | Approx. size |
|---------|------------------|--------------|
| Cities (ישובים) | [`8f714b6f-c35c-4b40-a0e7-547b675eee0e`](https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=1) | ~1,310 records |
| Streets + synonyms (רחובות עם שמות נרדפים) | [`bf185c7f-1a4e-4662-88c5-fa118a244bda`](https://data.gov.il/api/3/action/datastore_search?resource_id=bf185c7f-1a4e-4662-88c5-fa118a244bda&limit=1) | ~152k raw rows → ~63k unique streets |

City count in `cities.json` and “cities with streets” in the build log can differ by a few codes: the streets file sometimes lists a locality (small farm / settlement) that isn’t in the official ישובים list. City autocomplete uses `cities.json` only; orphan street files may still exist under `generated/streets/{cityCode}.json`. The build prints any orphan codes (with names from the streets file) when that happens.

Fetched via:

```
GET https://data.gov.il/api/3/action/datastore_search?resource_id=<id>
```

No API key required. See [data.gov.il](https://data.gov.il) for the full catalog.

Fetches use paginated `datastore_search` (32k page size — CKAN’s cap) with `User-Agent: datagov-external-client`, retries (404/429/502/503/504 + network errors, exponential backoff), and a short delay between pages. Cloud CI IPs sometimes get edge/WAF 404s on the same URL that works in a browser; fewer pages + the community UA reduces that.

## Contents (published)

| Path | Description |
|------|-------------|
| `generated/cities.json` | All cities (~1,300) |
| `generated/streets/{cityCode}.json` | Streets for one city |
| `generated/street-loader.js` | Lazy loader map (`cityCode → import(...)`) |
| `manifest.json` | CKAN `lastModified`, record counts, build timestamp |

## Data shapes

### Raw CKAN — cities

What we download into `raw/cities.json` (gitignored):

```ts
{
  _id: number;
  city_code: number;
  city_name_he: string;
  city_name_en: string;
  region_code: number;
  region_name: string;
  PIBA_bureau_code: number;
  PIBA_bureau_name: string;
  Regional_Council_code: number;
  Regional_Council_name: string | null;
}
```

### Raw CKAN — streets

What we download into `raw/streets.json` (gitignored). Each street can appear multiple times — once as `official`, plus synonym rows:

```ts
{
  _id: number;
  region_code: number;
  region_name: string;
  city_code: number;
  city_name: string;
  street_code: string;
  street_name: string;
  street_name_status: string; // e.g. "official" | "synonym of 100"
  official_code: number;
}
```

### Built — cities (`generated/cities.json`)

```ts
{
  code: number;        // city_code
  nameHe: string;      // city_name_he
  nameEn: string | null; // city_name_en
  regionCode: number;
  regionName: string;
}
```

### Built — streets (`generated/streets/{cityCode}.json`)

Official name + aliases collapsed into one record per `official_code`:

```ts
{
  code: number;        // official_code
  nameHe: string;      // official street name
  aliases: string[];   // synonym spellings (excluding the official name)
}
```

Example:

```json
{
  "code": 100,
  "nameHe": "דיזנגוף",
  "aliases": ["דיזינגוף"]
}
```

### Manifest (`manifest.json`)

```ts
{
  sources: {
    cities: { resourceId: string; lastModified: string; recordCount: number };
    streets: { resourceId: string; lastModified: string; recordCount: number };
  };
  built: {
    cityCount: number;
    uniqueStreetCount: number;
    rawStreetRecordCount: number;
    streetCountByCity: Record<string, number>;
    generatedAt: string;      // ISO timestamp of last content write
    generatedAtDate: string;  // DD-MM-YYYY — last gov.il data change (README badge)
  };
}
```

`sources.*.lastModified` comes from the government CKAN metadata (when gov.il last touched the resource). `built.generatedAt` / `generatedAtDate` are when we last synced **changed** city/street content from gov.il into `generated/` (the **last gov.il change** badge shows `generatedAtDate`). Rebuilds that only see a newer CKAN `lastModified` (same records) do not rewrite files, so the weekly sync does not open empty PRs. The cities / streets badges read counts from `manifest.json` on `main`.

## Transform notes

- City/street strings are trimmed; empty Hebrew names are dropped
- Street rows with status starting with `official` become `nameHe`; other statuses become `aliases`
- Streets are grouped by `city_code` + `official_code`, then written one JSON file per city
- Cities and streets are sorted Hebrew-locale (`he`)

## Rebuild

```bash
pnpm data:sync      # fetch from CKAN + build
pnpm data:build     # rebuild from packages/data/raw/
pnpm data:validate  # compare local counts against live CKAN
```

### Bring your own JSON

Drop files in `packages/data/raw/`:

- `cities.json` — see `raw/cities.json.example`
- `streets.json` — see `raw/streets.json.example`

Then run `pnpm data:build`.

## License

MIT — underlying geographic names are public data from [data.gov.il](https://data.gov.il).
