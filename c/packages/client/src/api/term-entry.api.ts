import { api } from './client';
import type { CreateTermEntryInput, TermEntry, UpdateTermEntryInput } from '@termbase/shared';

export const termApi = {
  listByConcept: (conceptId: number, lang?: string) =>
    api.get<TermEntry[]>(`/concepts/${conceptId}/terms${lang ? `?lang=${encodeURIComponent(lang)}` : ''}`),
  add: (conceptId: number, data: CreateTermEntryInput) =>
    api.post<TermEntry>(`/concepts/${conceptId}/terms`, data),
  update: (id: number, data: UpdateTermEntryInput) => api.put<TermEntry>(`/terms/${id}`, data),
  remove: (id: number) => api.del<{ deleted: boolean }>(`/terms/${id}`),
  search: (q: string, lang?: string) => {
    const qs = new URLSearchParams({ q });
    if (lang) qs.set('lang', lang);
    return api.get<Array<{ id: number; termText: string; languageCode: string; conceptId: number }>>(
      `/terms/search?${qs}`,
    );
  },
};
