import type { City, SearchOptions, Street } from "@il-address/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCityAutocomplete } from "./useCityAutocomplete.js";
import { useStreetAutocomplete } from "./useStreetAutocomplete.js";

export interface UseAddressAutocompleteOptions {
  onAddressChange?: (value: { city: City | null; street: Street | null }) => void;
  searchOptions?: SearchOptions;
}

export function useAddressAutocomplete(options: UseAddressAutocompleteOptions = {}) {
  const { onAddressChange, searchOptions } = options;
  const [city, setCity] = useState<City | null>(null);
  const [street, setStreet] = useState<Street | null>(null);
  const cityRef = useRef(city);
  const onAddressChangeRef = useRef(onAddressChange);

  useEffect(() => {
    cityRef.current = city;
  }, [city]);

  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
  });

  const handleCitySelect = useCallback((selected: City | null) => {
    setCity(selected);
    setStreet(null);
    onAddressChangeRef.current?.({ city: selected, street: null });
  }, []);

  const handleStreetSelect = useCallback((selected: Street | null) => {
    setStreet(selected);
    onAddressChangeRef.current?.({ city: cityRef.current, street: selected });
  }, []);

  const cityAutocomplete = useCityAutocomplete({
    onCitySelect: handleCitySelect,
    searchOptions,
  });

  const streetAutocomplete = useStreetAutocomplete({
    cityCode: city?.code ?? null,
    onStreetSelect: handleStreetSelect,
    searchOptions,
  });

  return {
    city: cityAutocomplete,
    street: streetAutocomplete,
    selectedCity: city,
    selectedStreet: street,
  };
}
