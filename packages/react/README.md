# @il-address/react

[![npm version](https://img.shields.io/npm/v/@il-address/react)](https://www.npmjs.com/package/@il-address/react)
[![npm downloads/week](https://img.shields.io/npm/dw/@il-address/react)](https://www.npmjs.com/package/@il-address/react)
[![npm downloads/month](https://img.shields.io/npm/dm/@il-address/react)](https://www.npmjs.com/package/@il-address/react)

Headless React hooks for Israeli city & street autocomplete. You own the markup and CSS.

**[Live React demo](https://il-address-autocomplete.netlify.app)** · [source](https://github.com/NirTatcher/il-address-autocomplete/tree/main/apps/playground)

## Install

```bash
npm install @il-address/react
```

Requires React 18+.

## Quick start

```tsx
import { useAddressAutocomplete } from "@il-address/react";

function AddressForm() {
  const { city, street, selectedCity, selectedStreet } = useAddressAutocomplete({
    searchOptions: { limit: 8 },
    onAddressChange: ({ city, street }) => {
      console.log({ city, street });
    },
  });

  return (
    <div dir="rtl">
      <input {...city.inputProps} placeholder="עיר" />
      <input {...street.inputProps} placeholder="רחוב" />
      <pre>{JSON.stringify({ city: selectedCity, street: selectedStreet }, null, 2)}</pre>
    </div>
  );
}
```

## Full example with suggestion lists

```tsx
import { useAddressAutocomplete } from "@il-address/react";

function AddressForm() {
  const { city, street } = useAddressAutocomplete({ searchOptions: { limit: 8 } });

  return (
    <div dir="rtl">
      <label>
        עיר
        <input {...city.inputProps} placeholder="הקלד שם עיר" />
        {city.isOpen && (
          <ul {...city.listboxProps}>
            {city.cities.map((item, i) => (
              <li key={item.code} {...city.getItemProps(i)}>
                {item.nameHe}
                {item.nameEn ? <span>{item.nameEn}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </label>

      <label>
        רחוב
        <input {...street.inputProps} placeholder="הקלד שם רחוב" />
        {street.isOpen && (
          <ul {...street.listboxProps}>
            {street.streets.map((item, i) => (
              <li key={item.code} {...street.getItemProps(i)}>
                {item.nameHe}
              </li>
            ))}
          </ul>
        )}
      </label>
    </div>
  );
}
```

## Hooks

| Hook | Description |
|------|-------------|
| `useAddressAutocomplete()` | City + street together (recommended) |
| `useCityAutocomplete()` | City only |
| `useStreetAutocomplete({ cityCode })` | Street only (requires a selected city) |
| `useAutocomplete()` | Low-level headless combobox primitive |

### useAddressAutocomplete options

```ts
useAddressAutocomplete({
  searchOptions: { limit: 8, minQueryLength: 2 },
  onCitySelect: (city) => console.log(city),
  onStreetSelect: (street) => console.log(street),
  onAddressChange: ({ city, street }) => console.log({ city, street }),
});
```

Each hook returns:

- `inputProps` — spread onto your `<input>`
- `getItemProps(index)` — spread onto each suggestion `<li>`
- `listboxProps` — spread onto your `<ul>`
- `isOpen`, `highlightedIndex`, selection state, and result lists

Keyboard navigation (↑/↓/Enter/Escape) is built in.

## Not using React?

Use [`@il-address/core`](https://www.npmjs.com/package/@il-address/core) directly — see the [vanilla JS demo](https://il-address-autocomplete.netlify.app/vanilla.html).

## License

MIT
