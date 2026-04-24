import type { CreateTermEntryInput, UpdateTermEntryInput } from '@termbase/shared';
import { termEntryRepository } from '../repositories/term-entry.repository.js';
import { conceptRepository } from '../repositories/concept.repository.js';
import { NotFoundError } from '../middleware/error-handler.js';

export const termEntryService = {
  async listByConcept(conceptId: number, lang?: string) {
    const concept = await conceptRepository.findById(conceptId);
    if (!concept) throw new NotFoundError(`Concept #${conceptId} not found`);
    return termEntryRepository.findByConceptAndLang(conceptId, lang);
  },

  async getById(id: number) {
    const entry = await termEntryRepository.findById(id);
    if (!entry) throw new NotFoundError(`Term entry #${id} not found`);
    return entry;
  },

  async create(conceptId: number, data: CreateTermEntryInput) {
    const concept = await conceptRepository.findById(conceptId);
    if (!concept) throw new NotFoundError(`Concept #${conceptId} not found`);

    const languageSection = await termEntryRepository.findOrCreateLanguageSection(
      conceptId,
      data.languageCode,
    );

    return termEntryRepository.create(languageSection.id, data);
  },

  async update(id: number, data: UpdateTermEntryInput) {
    const entry = await termEntryRepository.findById(id);
    if (!entry) throw new NotFoundError(`Term entry #${id} not found`);
    return termEntryRepository.update(id, data as Record<string, unknown>);
  },

  async delete(id: number) {
    const entry = await termEntryRepository.findById(id);
    if (!entry) throw new NotFoundError(`Term entry #${id} not found`);
    await termEntryRepository.delete(id);
  },

  async search(query: string, lang?: string, page?: number, pageSize?: number) {
    return termEntryRepository.search(query, lang, page, pageSize);
  },

  async getAllTermsByLanguage(languageCode: string): Promise<string[]> {
    const entries = await termEntryRepository.findAllByLanguage(languageCode);
    return entries.map((e) => e.termText);
  },

  async getTargetTermsForLanguage(
    sourceLang: string,
    targetLang: string,
  ): Promise<Map<string, string[]>> {
    const sourceEntries = await termEntryRepository.findAllByLanguage(sourceLang);
    const targetEntries = await termEntryRepository.findAllByLanguage(targetLang);

    // Build mapping: source term concept IDs → target terms
    const conceptTargetMap = new Map<number, string[]>();
    for (const entry of targetEntries) {
      const conceptId = entry.languageSection.conceptId;
      const existing = conceptTargetMap.get(conceptId) ?? [];
      existing.push(entry.termText);
      conceptTargetMap.set(conceptId, existing);
    }

    // Map source terms to target terms
    const sourceToTargets = new Map<string, string[]>();
    for (const entry of sourceEntries) {
      const conceptId = entry.languageSection.conceptId;
      const targets = conceptTargetMap.get(conceptId) ?? [];
      if (sourceToTargets.has(entry.termText)) {
        const existing = sourceToTargets.get(entry.termText)!;
        sourceToTargets.set(entry.termText, [...existing, ...targets]);
      } else {
        sourceToTargets.set(entry.termText, targets);
      }
    }

    return sourceToTargets;
  },
};
