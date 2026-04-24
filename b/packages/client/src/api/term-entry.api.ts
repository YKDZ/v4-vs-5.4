import type { CreateTermEntryInput, LanguageSection, UpdateTermEntryInput } from '@termbase/shared';
import { apiRequest } from './client';

export async function listTerms(conceptId: number, lang?: string) {
  const params = new URLSearchParams();
  if (lang) params.set('lang', lang);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<LanguageSection[]>(`/api/v1/concepts/${conceptId}/terms${suffix}`);
}

export async function createTerm(conceptId: number, payload: CreateTermEntryInput) {
  return apiRequest(`/api/v1/concepts/${conceptId}/terms`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTerm(id: number, payload: UpdateTermEntryInput) {
  return apiRequest(`/api/v1/terms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteTerm(id: number) {
  return apiRequest<{ deleted: boolean }>(`/api/v1/terms/${id}`, {
    method: 'DELETE',
  });
}
