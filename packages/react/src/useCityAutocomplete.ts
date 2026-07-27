import { searchCities, type City, type SearchOptions } from "@il-address/core";
import { useCallback, useMemo, useState } from "react";
import { useAutocomplete } from "./useAutocomplete.js";

export interface UseCityAutocompleteOptions {
  initialCity?: City | null;
  onCitySelect?: (city: City | null) => void;
  searchOptions?: SearchOptions;
}

export function useCityAutocomplete(options: UseCityAutocompleteOptions = {}) {
  const { initialCity = null, onCitySelect, searchOptions } = options;
  const [selectedCity, setSelectedCity] = useState<City | null>(initialCity);
  const [query, setQuery] = useState(initialCity?.nameHe ?? "");

  const suggestions = useMemo(
    () => searchCities(query, searchOptions),
    [query, searchOptions],
  );

  const handleSelect = useCallback(
    (city: City) => {
      setSelectedCity(city);
      setQuery(city.nameHe);
      onCitySelect?.(city);
    },
    [onCitySelect],
  );

  const autocomplete = useAutocomplete({
    items: suggestions,
    selectedItem: selectedCity,
    onSelect: handleSelect,
    getItemLabel: (city) => city.nameHe,
  });

  const inputProps = {
    ...autocomplete.inputProps,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setQuery(value);
      autocomplete.setInputValue(value);
      if (selectedCity && value !== selectedCity.nameHe) {
        setSelectedCity(null);
        onCitySelect?.(null);
      }
    },
  };

  return {
    ...autocomplete,
    inputProps,
    selectedCity,
    setSelectedCity,
    cities: suggestions,
  };
}
