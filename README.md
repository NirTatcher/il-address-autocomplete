# IL Address Autocomplete

[![CI](https://github.com/NirTatcher/il-address-autocomplete/actions/workflows/ci.yml/badge.svg)](https://github.com/NirTatcher/il-address-autocomplete/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@il-address/core)](https://www.npmjs.com/package/@il-address/core)
![npm](https://img.shields.io/npm/dw/@il-address/core)
![npm](https://img.shields.io/npm/dm/@il-address/core)
![npm](https://img.shields.io/npm/dy/@il-address/core)
[![license](https://img.shields.io/npm/l/@il-address/core)](https://github.com/NirTatcher/il-address-autocomplete/blob/main/LICENSE)
[![cities](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FNirTatcher%2Fil-address-autocomplete%2Fmain%2Fpackages%2Fdata%2Fmanifest.json&query=%24.built.cityCount&label=cities&color=0ea5e9)](./packages/data/manifest.json)
[![streets](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FNirTatcher%2Fil-address-autocomplete%2Fmain%2Fpackages%2Fdata%2Fmanifest.json&query=%24.built.uniqueStreetCount&label=streets&color=0ea5e9)](./packages/data/manifest.json)
[![last gov.il change](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FNirTatcher%2Fil-address-autocomplete%2Fmain%2Fpackages%2Fdata%2Fmanifest.json&query=%24.built.generatedAtDate&label=last%20gov.il%20change&color=8b5cf6)](./packages/data/manifest.json)

Headless Israeli city & street autocomplete for JavaScript and React. Data sourced from the official [data.gov.il](https://data.gov.il) CKAN API (Population & Immigration Authority).

**[Live demo](https://il-address-autocomplete.netlify.app)** · [Vanilla JS demo](https://il-address-autocomplete.netlify.app/vanilla.html) · [Playground source](./apps/playground)

## Install

```bash
npm install @il-address/core

# React apps
npm install @il-address/react
```

`@il-address/data` is installed automatically as a dependency of `@il-address/core`.

## Packages

| Package | Description |
|---------|-------------|
| [`@il-address/core`](./packages/core) | Pure TypeScript search API — works in any JS environment |
| [`@il-address/react`](./packages/react) | Headless React hooks with keyboard navigation |
| [`@il-address/data`](./packages/data) | Generated city/street data (transitive dependency) |

## Quick start (development)

```bash
pnpm install
pnpm data:sync    # fetch from data.gov.il + build JSON (first time / refresh)
pnpm build
pnpm dev          # playground at http://localhost:5173
```

## Core API (vanilla / any framework)

```ts
import { searchCities, loadStreets, searchStreets } from "@il-address/core";

const cities = searchCities("תל א");
// [{ code: 5000, nameHe: "תל אביב - יפו", nameEn: "Tel Aviv - Yafo", ... }]

const streets = await loadStreets(5000);
const matches = await searchStreets(5000, "דיזנג");
```

## Search options

Control how many suggestions are returned via `SearchOptions`:

```ts
searchCities("תל א", { limit: 5 });           // max 5 city results (default: 10)
searchStreets(5000, "דיז", { limit: 8 });     // max 8 street results
searchCities("ת", { minQueryLength: 2 });     // wait for 2+ chars before searching
```

React hooks accept the same options:

```tsx
useAddressAutocomplete({
  searchOptions: { limit: 5, minQueryLength: 2 },
});
```

When the street input is empty, the hook shows the first `limit` streets for the selected city. When typing, results are filtered and capped by `limit`.

Constants: `DEFAULT_SEARCH_LIMIT` (10), `DEFAULT_MIN_QUERY_LENGTH` (1).

## React hooks

```tsx
import { useAddressAutocomplete } from "@il-address/react";

function AddressForm() {
  const { city, street, selectedCity, selectedStreet } = useAddressAutocomplete({
    onAddressChange: ({ city, street }) => console.log({ city, street }),
    searchOptions: { limit: 8 },
  });

  return (
    <div dir="rtl">
      <input {...city.inputProps} placeholder="עיר" />
      <input {...street.inputProps} placeholder="רחוב" />
    </div>
  );
}
```

Hooks are **headless** — you own the markup and styling.

**Live examples:** [React demo](https://il-address-autocomplete.netlify.app) · [Vanilla JS demo](https://il-address-autocomplete.netlify.app/vanilla.html) · [source](./apps/playground)

## Data model

**Cities** include Hebrew and English names:

```ts
{ code: 5000, nameHe: "תל אביב - יפו", nameEn: "TEL AVIV - YAFO", ... }
```

**Streets** are Hebrew-only (per the government dataset):

```ts
{ code: 1234, nameHe: "דיזנגוף", aliases: ["דיזינגוף"] }
```

- ~1,300 cities bundled inline
- ~63,000 unique streets, lazy-loaded per city
- Hebrew normalization: nikud, final letters, synonyms

### Bring your own JSON

Drop files in `packages/data/raw/`:

- `cities.json`
- `streets.json`

See `packages/data/raw/*.example` for the CKAN format, then run `pnpm data:build`.

### Refresh from government API

```bash
pnpm data:sync
```

### Validate against CKAN

```bash
pnpm data:validate
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build core + react packages |
| `pnpm data:build` | Transform raw/ → generated/ (after fetch) |
| `pnpm test` | Run tests |
| `pnpm typecheck` | TypeScript check |
| `pnpm dev` | Start playground |
| `pnpm data:sync` | Fetch + rebuild data from data.gov.il |
| `pnpm data:validate` | Compare local data against live CKAN |

## CI / data freshness

- **Every PR/push:** `ci.yml` runs build, test, typecheck
- **Weekly (Sun + Wed ~03:17 UTC):** `data-sync.yml` fetches fresh gov data, validates, opens a PR only if city/street content changed (midweek slot is a GitHub-schedule backup)
- **Demo (Netlify):** not auto-deployed on every `main` push — run **Actions → Deploy Demo**, or Netlify → **Trigger deploy** (requires `NETLIFY_BUILD_HOOK` secret for the GitHub workflow)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Publish to npm

1. **Smoke test** — install packed tarballs in a fresh app (outside this monorepo):

```bash
pnpm build && pnpm test
pnpm --filter @il-address/data pack
pnpm --filter @il-address/core pack
pnpm --filter @il-address/react pack
# In a new folder: npm install react react-dom && npm install ./il-address-data-1.0.1.tgz ./il-address-core-1.0.1.tgz ./il-address-react-1.0.1.tgz
```

2. **Publish** (order matters — data first):

```bash
pnpm --filter @il-address/data publish --access public
pnpm --filter @il-address/core publish --access public
pnpm --filter @il-address/react publish --access public
```

Requires an npm org named `@il-address` (create at [npmjs.com/org/create](https://www.npmjs.com/org/create)) or rename the package scope.

## Project structure

```
packages/
  core/       # search, normalize, loadStreets
  react/      # useCityAutocomplete, useStreetAutocomplete, useAddressAutocomplete
  data/       # fetch/build scripts, generated JSON, manifest.json
apps/
  playground/ # Vite demo
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
