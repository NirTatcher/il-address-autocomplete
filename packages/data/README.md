# @il-address/data

[![npm version](https://img.shields.io/npm/v/@il-address/data)](https://www.npmjs.com/package/@il-address/data)

Israeli city and street data for `@il-address/core`. Typically installed automatically as a transitive dependency — you usually don't import this package directly.

Data is sourced from the official [data.gov.il](https://data.gov.il) CKAN API (Population & Immigration Authority / רשות האוכלוסין וההגירה).

## Official sources

| Dataset | CKAN resource ID | Approx. size |
|---------|------------------|--------------|
| Cities (ישובים) | [`8f714b6f-c35c-4b40-a0e7-547b675eee0e`](https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=1) | ~1,310 records |
| Streets + synonyms (רחובות עם שמות נרדפים) | [`bf185c7f-1a4e-4662-88c5-fa118a244bda`](https://data.gov.il/api/3/action/datastore_search?resource_id=bf185c7f-1a4e-4662-88c5-fa118a244bda&limit=1) | ~152k raw rows → ~63k unique streets |

Fetched via:

```
GET https://data.gov.il/api/3/action/datastore_search?resource_id=<id>
```

No API key required. See [data.gov.il](https://data.gov.il) for the full catalog.

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
    generatedAt: string;
  };
}
```

`sources.*.lastModified` comes from the government CKAN metadata (when gov.il last touched the resource). `built.generatedAt` is when we last wrote a **content** change (cities/streets JSON). Rebuilds that only see a newer CKAN `lastModified` (same records) do not rewrite files, so the weekly sync does not open empty PRs.

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
