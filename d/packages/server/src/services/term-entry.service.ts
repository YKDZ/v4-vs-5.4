import type {
  CreateTermEntryInput,
  TermSearchQueryInput,
  UpdateTermEntryInput,
} from "@termbase/shared";

import { ConceptRepository } from "../repositories/concept.repository";
import { TermEntryRepository } from "../repositories/term-entry.repository";
import { AppError } from "../types/app-error";

export class TermEntryService {
  constructor(
    private readonly conceptRepository: ConceptRepository,
    private readonly termEntryRepository: TermEntryRepository,
  ) {}

  async listByConceptAndLanguage(conceptId: number, languageCode: string) {
    return this.termEntryRepository.listByConceptAndLanguage(conceptId, languageCode);
  }

  async create(conceptId: number, payload: CreateTermEntryInput) {
    const conceptExists = await this.conceptRepository.exists(conceptId);
    if (!conceptExists) {
      throw new AppError("CONCEPT_NOT_FOUND", `Concept ${conceptId} not found`, 404);
    }
    return this.termEntryRepository.create(conceptId, payload);
  }

  async update(termId: number, payload: UpdateTermEntryInput) {
    const updated = await this.termEntryRepository.update(termId, payload);
    if (!updated) {
      throw new AppError("TERM_NOT_FOUND", `Term ${termId} not found`, 404);
    }
    return updated;
  }

  async delete(termId: number) {
    const deleted = await this.termEntryRepository.delete(termId);
    if (!deleted) {
      throw new AppError("TERM_NOT_FOUND", `Term ${termId} not found`, 404);
    }
  }

  async search(query: TermSearchQueryInput) {
    return this.termEntryRepository.search(query);
  }
}
