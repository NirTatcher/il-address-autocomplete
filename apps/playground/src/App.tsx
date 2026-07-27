import { getDataManifest } from "@il-address/core";
import { useAddressAutocomplete } from "@il-address/react";
import type { City, Street } from "@il-address/core";
import { DemoNav } from "./DemoNav";
import { formatBuildDate, formatGovDate } from "./shared/dates";

function SuggestionList<T extends City | Street>({
  items,
  highlightedIndex,
  getItemProps,
  listboxProps,
  isOpen,
  emptyMessage,
}: {
  items: T[];
  highlightedIndex: number;
  getItemProps: (index: number) => Record<string, unknown>;
  listboxProps: { id: string; role: "listbox" };
  isOpen: boolean;
  emptyMessage: string;
}) {
  if (!isOpen) return null;

  return (
    <ul className="suggestions" {...listboxProps}>
      {items.length === 0 ? (
        <li className="suggestion suggestion--empty">{emptyMessage}</li>
      ) : (
        items.map((item, index) => (
          <li
            key={"code" in item ? item.code : index}
            className={`suggestion${highlightedIndex === index ? " suggestion--active" : ""}`}
            {...getItemProps(index)}
          >
            {item.nameHe}
            {"nameEn" in item && item.nameEn ? (
              <span className="suggestion__meta">{item.nameEn}</span>
            ) : null}
          </li>
        ))
      )}
    </ul>
  );
}

export function App() {
  const manifest = getDataManifest();
  const address = useAddressAutocomplete({
    onAddressChange: ({ city, street }) => {
      console.log("Address changed:", { city, street });
    },
  });

  return (
    <main className="page">
      <DemoNav active="react" />

      <header className="hero">
        <p className="eyebrow">@il-address/react</p>
        <h1>כתובת בישראל — React</h1>
        <p className="subtitle">
          Headless hooks with keyboard navigation. Data from{" "}
          <a href="https://data.gov.il" target="_blank" rel="noreferrer">
            data.gov.il
          </a>
          .
        </p>
      </header>

      <section className="card">
        <label className="field">
          <span className="label">עיר</span>
          <input className="input" {...address.city.inputProps} placeholder="הקלד שם עיר" />
          <SuggestionList
            items={address.city.cities}
            highlightedIndex={address.city.highlightedIndex}
            getItemProps={address.city.getItemProps}
            listboxProps={address.city.listboxProps}
            isOpen={address.city.isOpen}
            emptyMessage="לא נמצאו ערים"
          />
        </label>

        <label className="field">
          <span className="label">רחוב</span>
          <input className="input" {...address.street.inputProps} />
          <SuggestionList
            items={address.street.streets}
            highlightedIndex={address.street.highlightedIndex}
            getItemProps={address.street.getItemProps}
            listboxProps={address.street.listboxProps}
            isOpen={address.street.isOpen && !address.street.isDisabled}
            emptyMessage={address.street.loading ? "טוען…" : "לא נמצאו רחובות"}
          />
        </label>

        <div className="selection">
          <h2>בחירה נוכחית</h2>
          <pre>{JSON.stringify(
            {
              city: address.selectedCity,
              street: address.selectedStreet,
            },
            null,
            2,
          )}</pre>
        </div>
      </section>

      <footer className="meta">
        <p className="meta__counts">
          <span>{manifest.built.cityCount.toLocaleString("he-IL")} ערים</span>
          <span>{manifest.built.uniqueStreetCount.toLocaleString("he-IL")} רחובות</span>
        </p>
        <p className="meta__built">נבנה: {formatBuildDate(manifest.built.generatedAt)}</p>
        <p className="meta__freshness">
          עודכן לאחרונה ב-{" "}
          <a href="https://data.gov.il" target="_blank" rel="noreferrer">
            data.gov.il
          </a>
          : ערים {formatGovDate(manifest.sources.cities.lastModified)}, רחובות{" "}
          {formatGovDate(manifest.sources.streets.lastModified)}
        </p>
      </footer>
    </main>
  );
}
