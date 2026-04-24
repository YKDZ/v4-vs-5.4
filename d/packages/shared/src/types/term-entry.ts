export type TermType = "fullForm" | "acronym" | "abbreviation" | "variant";
export type TermStatus = "preferred" | "admitted" | "deprecated";
export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "other";

export interface TermEntry {
  id: number;
  languageSectionId: number;
  termText: string;
  partOfSpeech: PartOfSpeech | null;
  termType: TermType | null;
  status: TermStatus;
  contextExample: string | null;
  definitionOverride: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTermEntryPayload {
  languageCode: string;
  termText: string;
  partOfSpeech?: PartOfSpeech;
  termType?: TermType;
  status?: TermStatus;
  contextExample?: string;
  definitionOverride?: string;
  source?: string;
}

export interface UpdateTermEntryPayload {
  termText?: string;
  partOfSpeech?: PartOfSpeech;
  termType?: TermType;
  status?: TermStatus;
  contextExample?: string;
  definitionOverride?: string;
  source?: string;
}

export interface TermSearchQuery {
  q: string;
  lang?: string;
}

export interface TermSearchResult {
  id: number;
  conceptId: number;
  languageCode: string;
  termText: string;
  status: TermStatus;
}
