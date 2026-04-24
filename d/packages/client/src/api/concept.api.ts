import type {
  Concept,
  ConceptListItem,
  ConceptListQuery,
  CreateConceptPayload,
  UpdateConceptPayload,
} from "@termbase/shared";

import { requestJson } from "./client";

function createQueryString(query: ConceptListQuery): string {
  const params = new URLSearchParams();
  if (query.page) {
    params.set("page", String(query.page));
  }
  if (query.pageSize) {
    params.set("pageSize", String(query.pageSize));
  }
  if (query.q) {
    params.set("q", query.q);
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function fetchConcepts(query: ConceptListQuery) {
  return requestJson<ConceptListItem[]>(`/concepts${createQueryString(query)}`);
}

export async function fetchConceptById(id: number) {
  return requestJson<Concept>(`/concepts/${id}`);
}

export async function createConcept(payload: CreateConceptPayload) {
  return requestJson<ConceptListItem>("/concepts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateConcept(id: number, payload: UpdateConceptPayload) {
  return requestJson<ConceptListItem>(`/concepts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteConcept(id: number) {
  return requestJson<{ deleted: boolean }>(`/concepts/${id}`, {
    method: "DELETE",
  });
}
