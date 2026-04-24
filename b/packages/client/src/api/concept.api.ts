import type { Concept, ConceptListItem, CreateConceptInput, UpdateConceptInput } from '@termbase/shared';
import { apiRequest } from './client';

export async function listConcepts(params: { page?: number; pageSize?: number; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);

  return apiRequest<ConceptListItem[]>(`/api/v1/concepts?${searchParams.toString()}`);
}

export async function getConcept(id: number) {
  return apiRequest<Concept>(`/api/v1/concepts/${id}`);
}

export async function createConcept(payload: CreateConceptInput) {
  return apiRequest<Concept>('/api/v1/concepts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateConcept(id: number, payload: UpdateConceptInput) {
  return apiRequest<Concept>(`/api/v1/concepts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteConcept(id: number) {
  return apiRequest<{ deleted: boolean }>(`/api/v1/concepts/${id}`, {
    method: 'DELETE',
  });
}
