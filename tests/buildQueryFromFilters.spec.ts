import { describe, it, expect } from "vitest";
import { buildQueryFromFilters } from "@/ui/filters/buildQueryFromFilters";
import { DEFAULT_FILTERS } from "@/ui/filters/types";

describe("buildQueryFromFilters", () => {
  it("builds basic category/taste/serve/allergen/range", () => {
    const f = { ...DEFAULT_FILTERS,
      category: "Hűs Kortyok",
      tastes: ["friss"],
      serve: { hot: false, lukewarm: false, iced: true, coldbrew: false },
      allergens_exclude: ["citrus"],
      caffeineRange: [0, 20],
      tempCRange: [80, 90],
      steepRange: [2, 6],
    };
    const q = buildQueryFromFilters("jeges citrus", f as any);
    expect(q).toContain('category:"Hűs Kortyok"');
    expect(q).toContain("taste:friss");
    expect(q).toContain("serve:jeges");
    expect(q).toContain("allergens:!citrus");
    expect(q).toContain("caffeine:<20");
    expect(q).toContain("tempC:>=80");
    expect(q).toContain("tempC:<=90");
    expect(q).toContain("steepMin:>=2");
    expect(q).toContain("steepMin:<=6");
  });
});