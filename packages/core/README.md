# @il-address/core

Headless Israeli city & street autocomplete for JavaScript.

## Install

```bash
npm install @il-address/core
```

## Usage

```ts
import {
  searchCities,
  loadStreets,
  searchStreets,
  DEFAULT_SEARCH_LIMIT,
} from "@il-address/core";

// Search cities (Hebrew or English)
const cities = searchCities("תל אביב", { limit: 5 });

// Load streets for a city (lazy, cached)
const streets = await loadStreets(5000);

// Search streets within a city
const matches = await searchStreets(5000, "דיזנג", { limit: 10 });
```

## API

| Function | Description |
|----------|-------------|
| `searchCities(query, options?)` | Search cities by Hebrew or English prefix |
| `searchStreets(cityCode, query, options?)` | Search streets in a city |
| `loadStreets(cityCode)` | Load all streets for a city (async) |
| `getCities()` | Get all cities |
| `getCityByCode(code)` | Get a single city |
| `getDataManifest()` | Data version / freshness metadata |

### SearchOptions

```ts
interface SearchOptions {
  limit?: number;           // default: 10
  minQueryLength?: number;  // default: 1
}
```

## Data

- Cities include `nameHe` and `nameEn`
- Streets include `nameHe` and `aliases` (synonyms) — no English names in the gov dataset

Data is provided by `@il-address/data` (installed automatically).

## License

MIT
