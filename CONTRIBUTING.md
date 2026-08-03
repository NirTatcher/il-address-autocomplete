# Contributing

Thanks for contributing to IL Address Autocomplete!

## Development setup

```bash
pnpm install
pnpm data:sync   # only needed if generated data is missing/outdated
pnpm build
pnpm dev         # playground
```

## Scripts

```bash
pnpm test          # unit + integration tests
pnpm typecheck     # TypeScript across all packages
pnpm data:validate # compare local data against live CKAN
```

## Data updates

City and street data comes from [data.gov.il](https://data.gov.il) (Population & Immigration Authority).

### Manual refresh

```bash
pnpm data:sync
```

This fetches from CKAN into `packages/data/raw/` and rebuilds `packages/data/generated/`.

### Automated weekly sync

The `data-sync` GitHub Action runs every Monday. It:

1. Fetches fresh data from data.gov.il
2. Rebuilds generated JSON
3. Runs validation and tests
4. Opens a PR **only if city/street JSON changed** (not for `lastModified` / `generatedAt`-only updates)

Review and merge the PR — nothing is auto-deployed or auto-published.

### Validation

`pnpm data:validate` checks:

- Record counts match live CKAN
- Anchor cities have expected street counts (Tel Aviv, Jerusalem, Haifa)
- Warns if CKAN has newer data than the committed manifest

## Pull requests

1. Fork and create a branch
2. Make changes
3. Run `pnpm build && pnpm test && pnpm typecheck`
4. Open a PR

## Project structure

- `packages/core` — search API
- `packages/react` — React hooks
- `packages/data` — data pipeline + generated JSON
- `apps/playground` — demo app

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
