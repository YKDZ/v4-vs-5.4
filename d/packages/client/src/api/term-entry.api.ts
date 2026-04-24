import type {
  CreateTermEntryPayload,
  TermEntry,
  TermSearchResult,
  UpdateTermEntryPayload,
} from "@termbase/shared";

import { requestJson } from "./client";

export async function fetchConceptTerms(conceptId: number, languageCode: string) {
  const params = new URLSearchParams({ lang: languageCode });
  return requestJson<TermEntry[]>(`/concepts/${conceptId}/terms?${params.toString()}`);
}

export async function createTermEntry(conceptId: number, payload: CreateTermEntryPayload) {
  return requestJson<TermEntry>(`/concepts/${conceptId}/terms`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTermEntry(termId: number, payload: UpdateTermEntryPayload) {
  return requestJson<TermEntry>(`/terms/${termId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTermEntry(termId: number) {
  return requestJson<{ deleted: boolean }>(`/terms/${termId}`, {
    method: "DELETE",
  });
}

export async function searchTerms(query: string, languageCode?: string) {
  const params = new URLSearchParams({ q: query });
  if (languageCode) {
    params.set("lang", languageCode);
  }
  return requestJson<TermSearchResult[]>(`/terms/search?${params.toString()}`);
}
