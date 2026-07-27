import { describe, expect, it } from "vitest";
import { normalizeHebrew, getSearchKeys } from "./normalize.js";
import { searchItems } from "./search.js";

describe("normalizeHebrew", () => {
  it("removes nikud and normalizes final letters for matching", () => {
    expect(normalizeHebrew("יִרוּשָׁלַיִם")).toBe("ירושלימ");
    expect(normalizeHebrew("ארץ")).toBe("ארצ");
  });

  it("collapses whitespace and hyphens", () => {
    expect(normalizeHebrew("תל  אביב - יפו")).toBe("תל אביב יפו");
  });
});

describe("getSearchKeys", () => {
  it("includes aliases", () => {
    const keys = getSearchKeys("דיזנגוף", ["דיזינגוף"]);
    expect(keys).toContain("דיזנגופ");
    expect(keys).toContain("דיזינגופ");
  });
});

describe("searchItems", () => {
  const items = [
    { nameHe: "תל אביב - יפו", nameEn: "Tel Aviv" },
    { nameHe: "ירושלים", nameEn: "Jerusalem" },
    { nameHe: "חיפה", nameEn: "Haifa" },
  ];

  it("matches Hebrew prefix", () => {
    expect(searchItems(items, "תל א").map((item) => item.nameHe)).toEqual([
      "תל אביב - יפו",
    ]);
  });

  it("matches English prefix", () => {
    expect(searchItems(items, "jer").map((item) => item.nameHe)).toEqual(["ירושלים"]);
  });
});
