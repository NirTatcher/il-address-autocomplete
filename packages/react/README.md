# @il-address/react

Headless React hooks for Israeli city & street autocomplete.

## Install

```bash
npm install @il-address/react
```

Requires React 18+.

## Usage

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
      {city.isOpen && (
        <ul {...city.listboxProps}>
          {city.cities.map((item, i) => (
            <li key={item.code} {...city.getItemProps(i)}>
              {item.nameHe}
            </li>
          ))}
        </ul>
      )}

      <input {...street.inputProps} placeholder="רחוב" />
      {street.isOpen && (
        <ul {...street.listboxProps}>
          {street.streets.map((item, i) => (
            <li key={item.code} {...street.getItemProps(i)}>
              {item.nameHe}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Hooks

| Hook | Description |
|------|-------------|
| `useAddressAutocomplete()` | City + street together |
| `useCityAutocomplete()` | City only |
| `useStreetAutocomplete({ cityCode })` | Street only (requires city) |
| `useAutocomplete()` | Low-level headless combobox primitive |

All hooks return `inputProps`, `getItemProps`, `listboxProps`, keyboard navigation, and selection state. You own the markup and CSS.

## License

MIT
