export interface Concept {
  id: number;
  uuid: string;
  definition: string | null;
  subjectField: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConceptWithLanguages extends Concept {
  languageSections: LanguageSectionWithTerms[];
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

export interface TermEntry {
  id: number;
  languageSectionId: number;
  termText: string;
  partOfSpeech: string | null;
  termType: string | null;
  status: string | null;
  contextExample: string | null;
  definitionOverride: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TermStatus = 'preferred' | 'admitted' | 'deprecated';
export type TermType = 'fullForm' | 'acronym' | 'abbreviation' | 'variant';
