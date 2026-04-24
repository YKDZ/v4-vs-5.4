import type {
  Concept,
  ConceptListItem,
  CreateConceptPayload,
  CreateTermEntryPayload,
  TermEntry,
  UpdateConceptPayload,
  UpdateTermEntryPayload,
} from "@termbase/shared";
import { defineStore } from "pinia";
import { ref } from "vue";

import {
  createConcept,
  deleteConcept,
  fetchConceptById,
  fetchConcepts,
  updateConcept,
} from "../api/concept.api";
import {
  createTermEntry,
  deleteTermEntry,
  fetchConceptTerms,
  updateTermEntry,
} from "../api/term-entry.api";

export const useConceptStore = defineStore("concept", () => {
  const concepts = ref<ConceptListItem[]>([]);
  const conceptDetail = ref<Concept | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const keyword = ref("");

  async function loadConcepts() {
    loading.value = true;
    error.value = null;
    try {
      const result = await fetchConcepts({
        page: page.value,
        pageSize: pageSize.value,
        q: keyword.value || undefined,
      });
      concepts.value = result.data;
      total.value = result.meta?.total ?? 0;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to fetch concepts";
    } finally {
      loading.value = false;
    }
  }

  async function loadConceptDetail(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const result = await fetchConceptById(id);
      conceptDetail.value = result.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to fetch concept detail";
      conceptDetail.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function addConcept(payload: CreateConceptPayload) {
    await createConcept(payload);
    await loadConcepts();
  }

  async function editConcept(id: number, payload: UpdateConceptPayload) {
    await updateConcept(id, payload);
    if (conceptDetail.value?.id === id) {
      await loadConceptDetail(id);
    }
    await loadConcepts();
  }

  async function removeConcept(id: number) {
    await deleteConcept(id);
    if (conceptDetail.value?.id === id) {
      conceptDetail.value = null;
    }
    await loadConcepts();
  }

  async function addTerm(conceptId: number, payload: CreateTermEntryPayload) {
    await createTermEntry(conceptId, payload);
    await loadConceptDetail(conceptId);
  }

  async function editTerm(conceptId: number, termId: number, payload: UpdateTermEntryPayload) {
    await updateTermEntry(termId, payload);
    await loadConceptDetail(conceptId);
  }

  async function removeTerm(conceptId: number, termId: number) {
    await deleteTermEntry(termId);
    await loadConceptDetail(conceptId);
  }

  async function loadTerms(conceptId: number, languageCode: string): Promise<TermEntry[]> {
    const result = await fetchConceptTerms(conceptId, languageCode);
    return result.data;
  }

  return {
    concepts,
    conceptDetail,
    loading,
    error,
    page,
    pageSize,
    total,
    keyword,
    loadConcepts,
    loadConceptDetail,
    addConcept,
    editConcept,
    removeConcept,
    addTerm,
    editTerm,
    removeTerm,
    loadTerms,
  };
});
