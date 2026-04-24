import type { ApiResponse, Concept, ConceptWithLanguages } from '@termbase/shared';
import type { CreateConceptInput, UpdateConceptInput, ConceptQuery } from '@termbase/shared';
import { apiClient } from './client.js';

export const conceptApi = {
  list(params: ConceptQuery) {
    const qs = new URLSearchParams();
    qs.set('page', String(params.page));
    qs.set('pageSize', String(params.pageSize));
    if (params.search) qs.set('search', params.search);
    return apiClient.get<ConceptWithLanguages[]>(`/concepts?${qs}`);
  },

  getById(id: number) {
    return apiClient.get<ConceptWithLanguages>(`/concepts/${id}`);
  },

  create(data: CreateConceptInput) {
    return apiClient.post<Concept>('/concepts', data);
  },

  update(id: number, data: UpdateConceptInput) {
    return apiClient.put<Concept>(`/concepts/${id}`, data);
  },

  delete(id: number) {
    return apiClient.delete<null>(`/concepts/${id}`);
  },
};
