import { api } from './client';
import type {
  Concept,
  ConceptWithDetails,
  CreateConceptInput,
  UpdateConceptInput,
} from '@termbase/shared';

export const conceptApi = {
  list: (params: { page?: number; pageSize?: number; q?: string; lang?: string } = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v != null && v !== '') qs.set(k, String(v));
    return api.get<Concept[]>('/concepts' + (qs.toString() ? `?${qs}` : ''));
  },
  get: (id: number) => api.get<ConceptWithDetails>(`/concepts/${id}`),
  create: (data: CreateConceptInput) => api.post<Concept>('/concepts', data),
  update: (id: number, data: UpdateConceptInput) => api.put<Concept>(`/concepts/${id}`, data),
  remove: (id: number) => api.del<{ deleted: boolean }>(`/concepts/${id}`),
};
