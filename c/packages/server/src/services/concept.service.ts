import type { DB } from '../db/index.js';
import { ConceptRepository } from '../repositories/concept.repository.js';
import { HttpError } from '../middleware/error-handler.js';
import type { CreateConceptInput, UpdateConceptInput, ListConceptsQuery } from '@termbase/shared';

export class ConceptService {
  private repo: ConceptRepository;
  constructor(db: DB) {
    this.repo = new ConceptRepository(db);
  }

  create(input: CreateConceptInput) {
    return this.repo.create(input);
  }

  async update(id: number, patch: UpdateConceptInput) {
    const updated = await this.repo.update(id, patch);
    if (!updated) throw new HttpError(404, 'CONCEPT_NOT_FOUND', `Concept ${id} not found`);
    return updated;
  }

  async remove(id: number) {
    const ok = await this.repo.deleteById(id);
    if (!ok) throw new HttpError(404, 'CONCEPT_NOT_FOUND', `Concept ${id} not found`);
  }

  async getDetail(id: number) {
    const row = await this.repo.getWithDetails(id);
    if (!row) throw new HttpError(404, 'CONCEPT_NOT_FOUND', `Concept ${id} not found`);
    return row;
  }

  list(params: ListConceptsQuery) {
    return this.repo.list(params);
  }
}
