import type { CreateTermEntryInput, UpdateTermEntryInput } from '@termbase/shared';
import { TermEntryRepository } from '../repositories/term-entry.repository';
import { NotFoundError } from '../utils/errors';

export class TermEntryService {
  constructor(private readonly termEntryRepository: TermEntryRepository) {}

  async listTermsByConcept(conceptId: number, languageCode?: string) {
    return this.termEntryRepository.listByConceptId(conceptId, languageCode);
  }

  async createTerm(conceptId: number, input: CreateTermEntryInput) {
    const term = await this.termEntryRepository.create(conceptId, input);
    if (!term) {
      throw new NotFoundError(`Concept ${conceptId} not found`);
    }

    return term;
  }

  async updateTerm(id: number, input: UpdateTermEntryInput) {
    const term = await this.termEntryRepository.update(id, input);
    if (!term) {
      throw new NotFoundError(`Term ${id} not found`);
    }

    return term;
  }

  async deleteTerm(id: number) {
    const deleted = await this.termEntryRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Term ${id} not found`);
    }
  }

  async searchTerms(query: { q: string; lang?: string; page: number; pageSize: number }) {
    return this.termEntryRepository.search(query);
  }
}
