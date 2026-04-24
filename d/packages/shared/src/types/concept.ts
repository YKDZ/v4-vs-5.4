export interface Concept {
  id: number;
  uuid: string;
  definition: string;
  subjectField: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  languageSections: LanguageSection[];
}

export interface ConceptListItem {
  id: number;
  uuid: string;
  definition: string;
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
  termEntries: TermEntry[];
}

export interface CreateConceptPayload {
  definition: string;
  subjectField?: string;
  note?: string;
}

export interface UpdateConceptPayload {
  definition?: string;
  subjectField?: string;
  note?: string;
}

export interface ConceptListQuery {
  page?: number;
  pageSize?: number;
  q?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

import type { TermEntry } from "./term-entry";
