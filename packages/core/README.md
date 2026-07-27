# @il-address/core

[![npm version](https://img.shields.io/npm/v/@il-address/core)](https://www.npmjs.com/package/@il-address/core)
[![npm downloads/week](https://img.shields.io/npm/dw/@il-address/core)](https://www.npmjs.com/package/@il-address/core)
[![npm downloads/month](https://img.shields.io/npm/dm/@il-address/core)](https://www.npmjs.com/package/@il-address/core)

Headless Israeli city & street autocomplete for JavaScript. Works with any framework or plain DOM.

**[Live vanilla demo](https://il-address-autocomplete.netlify.app/vanilla.html)** · [source](https://github.com/NirTatcher/il-address-autocomplete/tree/main/apps/playground)

## Install

```bash
npm install @il-address/core
```

Requires a bundler (Vite, webpack, Next.js, etc.) — JSON data is bundled at build time.

## Quick start

```ts
import { searchCities, searchStreets } from "@il-address/core";

// Search cities (Hebrew or English)
const cities = searchCities("תל א", { limit: 5 });
// [{ code: 5000, nameHe: "תל אביב - יפו", nameEn: "Tel Aviv - Yafo", ... }]

// Search streets in a city (lazy-loads street data on first call)
const streets = await searchStreets(5000, "דיזנג", { limit: 8 });
// [{ code: 1234, nameHe: "דיזנגוף", aliases: ["דיזינגוף"] }]
```

## Vanilla JS example

Wire inputs yourself — no React required:

```ts
import { searchCities, searchStreets, type City } from "@il-address/core";

const cityInput = document.querySelector<HTMLInputElement>("#city")!;
const cityList = document.querySelector<HTMLUListElement>("#city-list")!;
let selectedCity: City | null = null;

cityInput.addEventListener("input", () => {
  const cities = searchCities(cityInput.value, { limit: 8 });
  cityList.innerHTML = cities
    .map(
      (city) =>
        `<li data-code="${city.code}">${city.nameHe}${
          city.nameEn ? `<span>${city.nameEn}</span>` : ""
        }</li>`,
    )
    .join("");
});

cityList.addEventListener("click", (event) => {
  const item = (event.target as HTMLElement).closest("li");
  if (!item) return;

  const code = Number(item.dataset.code);
  selectedCity = searchCities(cityInput.value).find((c) => c.code === code) ?? null;
  cityInput.value = selectedCity?.nameHe ?? "";
});

const streetInput = document.querySelector<HTMLInputElement>("#street")!;

streetInput.addEventListener("input", async () => {
  if (!selectedCity) return;
  const streets = await searchStreets(selectedCity.code, streetInput.value, { limit: 8 });
  console.log(streets);
});
```

See the [full working demo](https://il-address-autocomplete.netlify.app/vanilla.html) with keyboard navigation.

## API

| Function | Description |
|----------|-------------|
| `searchCities(query, options?)` | Search cities by Hebrew or English prefix |
| `searchStreets(cityCode, query, options?)` | Search streets in a city |
| `loadStreets(cityCode)` | Load all streets for a city (async, cached) |
| `getCities()` | Get all cities |
| `getCityByCode(code)` | Get a single city |
| `getDataManifest()` | Gov source dates, build time, record counts |

### SearchOptions

```ts
interface SearchOptions {
  limit?: number;           // default: 10
  minQueryLength?: number;  // default: 1
}
```

### Data freshness

```ts
import { getDataManifest } from "@il-address/core";

const manifest = getDataManifest();
manifest.sources.cities.lastModified;  // gov.il cities file date
manifest.sources.streets.lastModified; // gov.il streets file date
manifest.built.generatedAt;            // when we last built the JSON
```

## Data

- Cities include `nameHe` and `nameEn`
- Streets include `nameHe` and `aliases` (synonyms) — no English names in the gov dataset
- ~1,300 cities bundled inline, ~63,000 streets lazy-loaded per city

Data is provided by `@il-address/data` (installed automatically).

## License

MIT
