import { describe, expect, it } from "vitest";
import {
  getCityCount,
  getDataManifest,
  loadStreets,
  searchCities,
  searchStreets,
} from "./index.js";

describe("integration", () => {
  it("loads full city dataset", () => {
    expect(getCityCount()).toBeGreaterThan(1000);
  });

  it("finds Tel Aviv by Hebrew prefix", () => {
    const results = searchCities("תל אביב", { limit: 5 });
    expect(results.some((city) => city.code === 5000)).toBe(true);
  });

  it("respects search limit", () => {
    const results = searchCities("י", { limit: 3 });
    expect(results).toHaveLength(3);
  });

  it("loads streets for Tel Aviv", async () => {
    const streets = await loadStreets(5000);
    expect(streets.length).toBeGreaterThan(2000);
  });

  it("finds Dizengoff street in Tel Aviv", async () => {
    const results = await searchStreets(5000, "דיזנג", { limit: 5 });
    expect(results.some((street) => street.nameHe.includes("דיזנגוף"))).toBe(true);
  });

  it("manifest matches built data", () => {
    const manifest = getDataManifest();
    expect(manifest.built.cityCount).toBe(getCityCount());
    expect(manifest.built.streetCountByCity["5000"]).toBeGreaterThan(2000);
  });
});
