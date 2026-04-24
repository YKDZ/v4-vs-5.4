import { describe, expect, it } from "vitest";

import { fuzzyMatch, levenshteinDistance, similarity } from "./fuzzy-match";

describe("fuzzy-match", () => {
  it("calculates levenshtein distance", () => {
    expect(levenshteinDistance("kitten", "sitting")).toBe(3);
  });

  it("returns exact match when candidate contains expected", () => {
    const result = fuzzyMatch("user interface", ["the user interface is ready"]);
    expect(result.matchType).toBe("exact");
    expect(result.score).toBe(1);
  });

  it("returns fuzzy match when similarity passes threshold", () => {
    const result = fuzzyMatch("quality assurance", ["qulity assurance"], 0.75);
    expect(result.matchType).toBe("fuzzy");
    expect(result.matched).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0.75);
  });

  it("computes normalized similarity", () => {
    expect(similarity("User Interface", "user interface")).toBe(1);
  });
});
