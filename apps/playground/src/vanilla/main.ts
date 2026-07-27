import {
  getDataManifest,
  searchCities,
  searchStreets,
  type City,
  type Street,
} from "@il-address/core";
import { renderDemoNav } from "../shared/demo-nav";
import { formatBuildDate, formatGovDate } from "../shared/dates";
import "../styles.css";

const SEARCH_LIMIT = 8;

interface AutocompleteState<T> {
  items: T[];
  highlightedIndex: number;
  isOpen: boolean;
}

function createAutocompleteState<T>(): AutocompleteState<T> {
  return { items: [], highlightedIndex: -1, isOpen: false };
}

function renderSuggestions<T extends City | Street>(
  list: HTMLUListElement,
  items: T[],
  highlightedIndex: number,
  emptyMessage: string,
  onSelect: (item: T) => void,
): void {
  list.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "suggestion suggestion--empty";
    empty.textContent = emptyMessage;
    list.appendChild(empty);
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = `suggestion${highlightedIndex === index ? " suggestion--active" : ""}`;
    li.textContent = item.nameHe;

    if ("nameEn" in item && item.nameEn) {
      const meta = document.createElement("span");
      meta.className = "suggestion__meta";
      meta.textContent = item.nameEn;
      li.appendChild(meta);
    }

    li.addEventListener("mousedown", (event) => {
      event.preventDefault();
      onSelect(item);
    });

    list.appendChild(li);
  });
}

function renderFooter(): void {
  const manifest = getDataManifest();
  const footer = document.getElementById("meta");
  if (!footer) return;

  footer.innerHTML = `
    <p class="meta__counts">
      <span>${manifest.built.cityCount.toLocaleString("he-IL")} ערים</span>
      <span>${manifest.built.uniqueStreetCount.toLocaleString("he-IL")} רחובות</span>
    </p>
    <p class="meta__built">נבנה: ${formatBuildDate(manifest.built.generatedAt)}</p>
    <p class="meta__freshness">
      עודכן לאחרונה ב-
      <a href="https://data.gov.il" target="_blank" rel="noreferrer">data.gov.il</a>:
      ערים ${formatGovDate(manifest.sources.cities.lastModified)},
      רחובות ${formatGovDate(manifest.sources.streets.lastModified)}
    </p>
  `;
}

function renderSelection(city: City | null, street: Street | null): void {
  const pre = document.getElementById("selection");
  if (!pre) return;
  pre.textContent = JSON.stringify({ city, street }, null, 2);
}

function main(): void {
  const navHost = document.getElementById("demo-nav");
  if (navHost) navHost.innerHTML = renderDemoNav("vanilla");

  const cityInput = document.getElementById("city-input") as HTMLInputElement;
  const cityList = document.getElementById("city-suggestions") as HTMLUListElement;
  const streetInput = document.getElementById("street-input") as HTMLInputElement;
  const streetList = document.getElementById("street-suggestions") as HTMLUListElement;

  let selectedCity: City | null = null;
  let selectedStreet: Street | null = null;
  let streetLoading = false;

  const cityState = createAutocompleteState<City>();
  const streetState = createAutocompleteState<Street>();

  function closeCityList(): void {
    cityState.isOpen = false;
    cityList.classList.add("hidden");
  }

  function closeStreetList(): void {
    streetState.isOpen = false;
    streetList.classList.add("hidden");
  }

  function updateCitySuggestions(): void {
    cityState.items = searchCities(cityInput.value, { limit: SEARCH_LIMIT });
    cityState.highlightedIndex = cityState.items.length > 0 ? 0 : -1;
    cityState.isOpen = true;
    cityList.classList.remove("hidden");
    renderSuggestions(cityList, cityState.items, cityState.highlightedIndex, "לא נמצאו ערים", selectCity);
  }

  function updateStreetSuggestions(): void {
    if (!selectedCity) return;

    streetLoading = true;
    renderSuggestions(streetList, [], -1, "טוען…", selectStreet);

    void searchStreets(selectedCity.code, streetInput.value, { limit: SEARCH_LIMIT }).then((items) => {
      streetLoading = false;
      streetState.items = items;
      streetState.highlightedIndex = items.length > 0 ? 0 : -1;
      streetState.isOpen = true;
      streetList.classList.remove("hidden");
      renderSuggestions(
        streetList,
        streetState.items,
        streetState.highlightedIndex,
        "לא נמצאו רחובות",
        selectStreet,
      );
    });
  }

  function selectCity(city: City): void {
    selectedCity = city;
    selectedStreet = null;
    cityInput.value = city.nameHe;
    closeCityList();

    streetInput.disabled = false;
    streetInput.placeholder = "הקלד שם רחוב";
    streetInput.value = "";
    streetInput.focus();
    renderSelection(selectedCity, selectedStreet);
    updateStreetSuggestions();
  }

  function selectStreet(street: Street): void {
    selectedStreet = street;
    streetInput.value = street.nameHe;
    closeStreetList();
    renderSelection(selectedCity, selectedStreet);
  }

  function moveHighlight(state: AutocompleteState<City | Street>, direction: 1 | -1): void {
    if (state.items.length === 0) return;
    const next = state.highlightedIndex + direction;
    if (next < 0) {
      state.highlightedIndex = state.items.length - 1;
      return;
    }
    state.highlightedIndex = next % state.items.length;
  }

  cityInput.addEventListener("input", () => {
    selectedCity = null;
    selectedStreet = null;
    streetInput.disabled = true;
    streetInput.value = "";
    streetInput.placeholder = "בחר עיר קודם";
    renderSelection(null, null);
    updateCitySuggestions();
  });

  cityInput.addEventListener("focus", () => {
    updateCitySuggestions();
  });

  cityInput.addEventListener("blur", () => {
    window.setTimeout(closeCityList, 120);
  });

  cityInput.addEventListener("keydown", (event) => {
    if (!cityState.isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(cityState, 1);
      renderSuggestions(cityList, cityState.items, cityState.highlightedIndex, "לא נמצאו ערים", selectCity);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(cityState, -1);
      renderSuggestions(cityList, cityState.items, cityState.highlightedIndex, "לא נמצאו ערים", selectCity);
    } else if (event.key === "Enter" && cityState.highlightedIndex >= 0) {
      event.preventDefault();
      const item = cityState.items[cityState.highlightedIndex];
      if (item) selectCity(item);
    } else if (event.key === "Escape") {
      closeCityList();
    }
  });

  streetInput.addEventListener("input", () => {
    selectedStreet = null;
    renderSelection(selectedCity, null);
    updateStreetSuggestions();
  });

  streetInput.addEventListener("focus", () => {
    if (selectedCity) updateStreetSuggestions();
  });

  streetInput.addEventListener("blur", () => {
    window.setTimeout(closeStreetList, 120);
  });

  streetInput.addEventListener("keydown", (event) => {
    if (!streetState.isOpen || streetLoading) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(streetState, 1);
      renderSuggestions(
        streetList,
        streetState.items,
        streetState.highlightedIndex,
        "לא נמצאו רחובות",
        selectStreet,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(streetState, -1);
      renderSuggestions(
        streetList,
        streetState.items,
        streetState.highlightedIndex,
        "לא נמצאו רחובות",
        selectStreet,
      );
    } else if (event.key === "Enter" && streetState.highlightedIndex >= 0) {
      event.preventDefault();
      const item = streetState.items[streetState.highlightedIndex];
      if (item) selectStreet(item);
    } else if (event.key === "Escape") {
      closeStreetList();
    }
  });

  renderFooter();
  renderSelection(null, null);
}

main();
