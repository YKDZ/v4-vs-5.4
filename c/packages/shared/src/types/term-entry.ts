export type TermType = 'fullForm' | 'acronym' | 'abbreviation' | 'variant';
export type TermStatus = 'preferred' | 'admitted' | 'deprecated';

export interface TermEntry {
  id: number;
  languageSectionId: number;
  termText: string;
  partOfSpeech: string | null;
  termType: TermType | null;
  status: TermStatus | null;
  contextExample: string | null;
  definitionOverride: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}
