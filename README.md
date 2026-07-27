# IL Address Autocomplete

Headless Israeli city & street autocomplete for JavaScript and React. Data sourced from the official [data.gov.il](https://data.gov.il) CKAN API (Population & Immigration Authority).

**[Live demo](https://il-address-autocomplete.netlify.app)** · [Playground source](./apps/playground)

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

Hooks are **headless** — you own the markup and styling. See [`apps/playground`](./apps/playground) for a full example.

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
- **Weekly (Mondays):** `data-sync.yml` fetches fresh gov data, validates, opens a PR if anything changed

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Publish to npm

1. **Smoke test** — install packed tarballs in a fresh app (outside this monorepo):

```bash
pnpm build && pnpm test
pnpm --filter @il-address/data pack
pnpm --filter @il-address/core pack
pnpm --filter @il-address/react pack
# In a new folder: npm install react react-dom && npm install ./il-address-data-0.1.0.tgz ./il-address-core-0.1.0.tgz ./il-address-react-0.1.0.tgz
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

## Roadmap

- [x] Core search API
- [x] React headless hooks
- [x] data.gov.il fetch + build pipeline
- [x] Data manifest for CI drift checks
- [x] CI workflow (build + test)
- [x] npm-publishable packages
- [x] Weekly data sync workflow
- [x] Live playground demo (Netlify)
- [ ] shadcn/ui integration recipes
- [ ] Pre-built UI components

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
