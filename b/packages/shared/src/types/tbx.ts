import type { Concept } from './concept';

export interface TbxImportResult {
  importedConcepts: number;
  importedTerms: number;
  concepts: Concept[];
}
