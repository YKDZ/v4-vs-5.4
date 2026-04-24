import type { TermEntry, TermEntryInput } from './term-entry';

export interface LanguageSection {
  id: number;
  conceptId: number;
  languageCode: string;
  createdAt: string;
  termEntries: TermEntry[];
}

export interface Concept {
  id: number;
  uuid: string;
  definition: string;
  subjectField: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  languageSections: LanguageSection[];
}

export interface ConceptListItem {
  id: number;
  uuid: string;
  definition: string;
  subjectField: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  languageCodes: string[];
  termCount: number;
}

export interface ConceptInput {
  definition: string;
  subjectField: string;
  note?: string | null;
  languageSections: Array<{
    languageCode: string;
    termEntries: Omit<TermEntryInput, 'languageCode'>[];
  }>;
}

export interface ConceptQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}
