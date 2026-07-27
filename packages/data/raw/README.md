# Raw data

Place your own JSON files here to override the official data.gov.il source:

- `cities.json` — array of city records (see `cities.json.example`)
- `streets.json` — flat array of street records with synonyms (see `streets.json.example`)

Then run:

```bash
pnpm data:build
```

To fetch fresh data from [data.gov.il](https://data.gov.il) instead:

```bash
pnpm data:sync
```
