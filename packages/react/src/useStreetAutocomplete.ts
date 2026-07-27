import {
  loadStreets,
  searchItems,
  type SearchOptions,
  type Street,
} from "@il-address/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAutocomplete } from "./useAutocomplete.js";

export interface UseStreetAutocompleteOptions {
  cityCode: number | null;
  initialStreet?: Street | null;
  onStreetSelect?: (street: Street | null) => void;
  searchOptions?: SearchOptions;
}

export function useStreetAutocomplete(options: UseStreetAutocompleteOptions) {
  const { cityCode, initialStreet = null, onStreetSelect, searchOptions } = options;
  const [selectedStreet, setSelectedStreet] = useState<Street | null>(initialStreet);
  const [streets, setStreets] = useState<Street[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialStreet?.nameHe ?? "");
  const onStreetSelectRef = useRef(onStreetSelect);

  useEffect(() => {
    onStreetSelectRef.current = onStreetSelect;
  });

  useEffect(() => {
    let cancelled = false;

    if (!cityCode) {
      setStreets([]);
      setSelectedStreet(null);
      setQuery("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setSelectedStreet(null);
    setQuery("");

    void loadStreets(cityCode)
      .then((loaded) => {
        if (cancelled) return;
        setStreets(loaded);
        onStreetSelectRef.current?.(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error(`Failed to load streets for city ${cityCode}`, error);
        setStreets([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cityCode]);

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return streets.slice(0, searchOptions?.limit ?? 10);
    }
    return searchItems(streets, query, searchOptions);
  }, [streets, query, searchOptions]);

  const handleSelect = useCallback(
    (street: Street) => {
      setSelectedStreet(street);
      setQuery(street.nameHe);
      onStreetSelectRef.current?.(street);
    },
    [],
  );

  const autocomplete = useAutocomplete({
    items: suggestions,
    selectedItem: selectedStreet,
    onSelect: handleSelect,
    getItemLabel: (street) => street.nameHe,
    disabled: !cityCode || loading,
  });

  const inputProps = {
    ...autocomplete.inputProps,
    placeholder: loading ? "טוען רחובות…" : "הקלד שם רחוב",
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setQuery(value);
      autocomplete.setInputValue(value);
      if (selectedStreet && value !== selectedStreet.nameHe) {
        setSelectedStreet(null);
        onStreetSelectRef.current?.(null);
      }
    },
  };

  return {
    ...autocomplete,
    inputProps,
    selectedStreet,
    setSelectedStreet,
    streets: suggestions,
    loading,
    isDisabled: !cityCode || loading,
  };
}
