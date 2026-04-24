import type { TermEntry } from './term-entry.js';

export interface Concept {
  id: number;
  uuid: string;
  definition: string | null;
  subjectField: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageSection {
  id: number;
  conceptId: number;
  languageCode: string;
  createdAt: string;
}

export interface LanguageSectionWithTerms extends LanguageSection {
  termEntries: TermEntry[];
}

export interface ConceptWithDetails extends Concept {
  languageSections: LanguageSectionWithTerms[];
}
