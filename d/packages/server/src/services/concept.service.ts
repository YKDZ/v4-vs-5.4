import type { ConceptListQueryInput, CreateConceptInput, UpdateConceptInput } from "@termbase/shared";

import { ConceptRepository } from "../repositories/concept.repository";
import { AppError } from "../types/app-error";

export class ConceptService {
  constructor(private readonly conceptRepository: ConceptRepository) {}

  async list(query: ConceptListQueryInput) {
    return this.conceptRepository.list(query);
  }

  async getById(id: number) {
    const concept = await this.conceptRepository.getById(id);
    if (!concept) {
      throw new AppError("CONCEPT_NOT_FOUND", `Concept ${id} not found`, 404);
    }
    return concept;
  }

  async create(payload: CreateConceptInput) {
    return this.conceptRepository.create(payload);
  }

  async update(id: number, payload: UpdateConceptInput) {
    const concept = await this.conceptRepository.update(id, payload);
    if (!concept) {
      throw new AppError("CONCEPT_NOT_FOUND", `Concept ${id} not found`, 404);
    }
    return concept;
  }

  async delete(id: number) {
    const deleted = await this.conceptRepository.delete(id);
    if (!deleted) {
      throw new AppError("CONCEPT_NOT_FOUND", `Concept ${id} not found`, 404);
    }
  }
}
