import type { ApiResponse, TermEntry, LanguageSectionWithTerms } from '@termbase/shared';
import type { CreateTermEntryInput, UpdateTermEntryInput, TermSearchQuery } from '@termbase/shared';
import { apiClient } from './client.js';

export const termEntryApi = {
  listByConcept(conceptId: number, lang?: string) {
    const qs = lang ? `?lang=${lang}` : '';
    return apiClient.get<LanguageSectionWithTerms[]>(`/concepts/${conceptId}/terms${qs}`);
  },

  create(conceptId: number, data: CreateTermEntryInput) {
    return apiClient.post<TermEntry>(`/concepts/${conceptId}/terms`, data);
  },

  update(id: number, data: UpdateTermEntryInput) {
    return apiClient.put<TermEntry>(`/terms/${id}`, data);
  },

  delete(id: number) {
    return apiClient.delete<null>(`/terms/${id}`);
  },

  search(query: TermSearchQuery) {
    const qs = new URLSearchParams();
    qs.set('q', query.q);
    qs.set('page', String(query.page));
    qs.set('pageSize', String(query.pageSize));
    if (query.lang) qs.set('lang', query.lang);
    return apiClient.get<TermEntry[]>(`/terms/search?${qs}`);
  },
};
