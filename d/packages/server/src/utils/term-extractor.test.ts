import { describe, expect, it } from "vitest";

import { extractTermsFromText } from "./term-extractor";

describe("term-extractor", () => {
  it("extracts exact terms from source text", () => {
    const sourceText =
      "The user interface and quality assurance workflow must be documented.";
    const extracted = extractTermsFromText(sourceText, [
      "user interface",
      "quality assurance",
      "canary release",
    ]);

    expect(extracted.map((item) => item.sourceTerm)).toEqual([
      "user interface",
      "quality assurance",
    ]);
  });

  it("extracts fuzzy terms by edit distance", () => {
    const sourceText = "Please update the qulity assurance checklist.";
    const extracted = extractTermsFromText(sourceText, ["quality assurance"], 0.75);
    expect(extracted.length).toBe(1);
    expect(extracted[0]?.matchType).toBe("fuzzy");
  });
});
