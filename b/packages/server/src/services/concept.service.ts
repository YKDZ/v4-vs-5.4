import type { ConceptQueryInput, CreateConceptInput, UpdateConceptInput } from '@termbase/shared';
import { seedConcepts } from '../db/seed-data';
import { ConceptRepository } from '../repositories/concept.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class ConceptService {
  constructor(private readonly conceptRepository: ConceptRepository) {}

  private validateLanguageSections(input: Pick<CreateConceptInput, 'languageSections'> | Pick<UpdateConceptInput, 'languageSections'>) {
    if (!input.languageSections) {
      return;
    }

    const seen = new Set<string>();
    for (const section of input.languageSections) {
      if (seen.has(section.languageCode)) {
        throw new BadRequestError(`Duplicate language section: ${section.languageCode}`);
      }

      seen.add(section.languageCode);
    }
  }

  async listConcepts(query: ConceptQueryInput) {
    return this.conceptRepository.list(query);
  }

  async getConceptById(id: number) {
    const concept = await this.conceptRepository.getById(id);
    if (!concept) {
      throw new NotFoundError(`Concept ${id} not found`);
    }

    return concept;
  }

  async createConcept(input: CreateConceptInput) {
    this.validateLanguageSections(input);
    return this.conceptRepository.create(input);
  }

  async updateConcept(id: number, input: UpdateConceptInput) {
    this.validateLanguageSections(input);
    const concept = await this.conceptRepository.update(id, input);
    if (!concept) {
      throw new NotFoundError(`Concept ${id} not found`);
    }

    return concept;
  }

  async deleteConcept(id: number) {
    const deleted = await this.conceptRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Concept ${id} not found`);
    }
  }

  async seedIfEmpty() {
    const total = await this.conceptRepository.count();
    if (total > 0) {
      return;
    }

    for (const concept of seedConcepts) {
      await this.conceptRepository.create(concept);
    }
  }
}
