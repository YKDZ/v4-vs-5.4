import { fuzzyMatch, similarity } from "./fuzzy-match";

export interface ExtractedTerm {
  sourceTerm: string;
  matchedText: string;
  score: number;
  matchType: "exact" | "fuzzy";
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createNgrams(tokens: string[], n: number): string[] {
  if (n <= 0 || tokens.length < n) {
    return [];
  }
  const output: string[] = [];
  for (let i = 0; i <= tokens.length - n; i += 1) {
    output.push(tokens.slice(i, i + n).join(" "));
  }
  return output;
}

export function extractTermsFromText(
  sourceText: string,
  termCandidates: string[],
  threshold = 0.75,
): ExtractedTerm[] {
  const normalizedText = normalize(sourceText);
  const tokens = normalizedText.split(" ").filter(Boolean);
  const extracted = new Map<string, ExtractedTerm>();

  for (const candidate of termCandidates) {
    const normalizedCandidate = normalize(candidate);
    if (!normalizedCandidate) {
      continue;
    }

    const exactRegex = new RegExp(`\\b${normalizedCandidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "u");
    if (exactRegex.test(normalizedText)) {
      extracted.set(candidate, {
        sourceTerm: candidate,
        matchedText: candidate,
        score: 1,
        matchType: "exact",
      });
      continue;
    }

    const candidateTokenCount = normalizedCandidate.split(" ").length;
    const windows = [
      ...createNgrams(tokens, Math.max(1, candidateTokenCount - 1)),
      ...createNgrams(tokens, candidateTokenCount),
      ...createNgrams(tokens, candidateTokenCount + 1),
    ];

    if (windows.length === 0) {
      continue;
    }

    const match = fuzzyMatch(normalizedCandidate, windows, threshold);
    if (match.matched && match.matchedTerm) {
      extracted.set(candidate, {
        sourceTerm: candidate,
        matchedText: match.matchedTerm,
        score: match.score,
        matchType: match.matchType === "exact" ? "exact" : "fuzzy",
      });
      continue;
    }

    // 对超短词降权，避免误检（如 "ui"）
    if (normalizedCandidate.length <= 3) {
      continue;
    }
    const bestWindow = windows.reduce(
      (best, current) =>
        similarity(normalizedCandidate, current) > similarity(normalizedCandidate, best)
          ? current
          : best,
      windows[0],
    );
    const score = similarity(normalizedCandidate, bestWindow);
    if (score >= threshold) {
      extracted.set(candidate, {
        sourceTerm: candidate,
        matchedText: bestWindow,
        score,
        matchType: "fuzzy",
      });
    }
  }

  return [...extracted.values()];
}
