import { conceptRepository } from '../repositories/concept.repository.js';
import { NotFoundError } from '../middleware/error-handler.js';

export const conceptService = {
  async list(params: { page?: number; pageSize?: number; search?: string }) {
    return conceptRepository.findAll(params.page, params.pageSize, params.search);
  },

  async getById(id: number) {
    const concept = await conceptRepository.findById(id);
    if (!concept) throw new NotFoundError(`Concept #${id} not found`);
    return concept;
  },

  async getByUuid(uuid: string) {
    const concept = await conceptRepository.findByUuid(uuid);
    if (!concept) throw new NotFoundError(`Concept ${uuid} not found`);
    return concept;
  },

  async create(data: { definition?: string; subjectField?: string; note?: string }) {
    return conceptRepository.create(data);
  },

  async update(id: number, data: { definition?: string | null; subjectField?: string | null; note?: string | null }) {
    const concept = await conceptRepository.findById(id);
    if (!concept) throw new NotFoundError(`Concept #${id} not found`);
    return conceptRepository.update(id, data);
  },

  async delete(id: number) {
    const concept = await conceptRepository.findById(id);
    if (!concept) throw new NotFoundError(`Concept #${id} not found`);
    await conceptRepository.delete(id);
  },
};
