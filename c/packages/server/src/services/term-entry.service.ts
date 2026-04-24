import type { DB } from '../db/index.js';
import { TermEntryRepository } from '../repositories/term-entry.repository.js';
import { ConceptRepository } from '../repositories/concept.repository.js';
import { HttpError } from '../middleware/error-handler.js';
import type { CreateTermEntryInput, UpdateTermEntryInput, SearchTermsQuery } from '@termbase/shared';

export class TermEntryService {
  private repo: TermEntryRepository;
  private conceptRepo: ConceptRepository;
  constructor(db: DB) {
    this.repo = new TermEntryRepository(db);
    this.conceptRepo = new ConceptRepository(db);
  }

  async addToConcept(conceptId: number, input: CreateTermEntryInput) {
    const exists = await this.conceptRepo.exists(conceptId);
    if (!exists) throw new HttpError(404, 'CONCEPT_NOT_FOUND', `Concept ${conceptId} not found`);
    return this.repo.createForConcept(conceptId, input);
  }

  async update(id: number, patch: UpdateTermEntryInput) {
    const updated = await this.repo.update(id, patch);
    if (!updated) throw new HttpError(404, 'TERM_NOT_FOUND', `Term ${id} not found`);
    return updated;
  }

  async remove(id: number) {
    const ok = await this.repo.deleteById(id);
    if (!ok) throw new HttpError(404, 'TERM_NOT_FOUND', `Term ${id} not found`);
  }

  listByConcept(conceptId: number, lang?: string) {
    return this.repo.listByConceptAndLang(conceptId, lang);
  }

  search(params: SearchTermsQuery) {
    return this.repo.search(params);
  }
}
