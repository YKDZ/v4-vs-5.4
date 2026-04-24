export const termTypes = ['fullForm', 'acronym', 'abbreviation', 'variant'] as const;
export const termStatuses = ['preferred', 'admitted', 'deprecated'] as const;

export type TermType = (typeof termTypes)[number];
export type TermStatus = (typeof termStatuses)[number];

export interface TermEntry {
  id: number;
  languageSectionId: number;
  termText: string;
  partOfSpeech: string | null;
  termType: TermType;
  status: TermStatus;
  contextExample: string | null;
  definitionOverride: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TermEntryInput {
  languageCode: string;
  termText: string;
  partOfSpeech?: string | null;
  termType: TermType;
  status: TermStatus;
  contextExample?: string | null;
  definitionOverride?: string | null;
  source?: string | null;
}
