# Generated data

This package contains Israeli city and street data built from [data.gov.il](https://data.gov.il).

## Contents

- `generated/cities.json` — ~1,300 cities
- `generated/streets/{cityCode}.json` — streets per city (~63k unique)
- `generated/street-loader.js` — lazy loader for street files
- `manifest.json` — build metadata and CKAN sync timestamps

## Rebuild

```bash
pnpm data:sync    # fetch from CKAN + build
pnpm data:build   # rebuild from packages/data/raw/
pnpm data:validate
```

## Note

This package is a transitive dependency of `@il-address/core`. You typically don't import it directly.
