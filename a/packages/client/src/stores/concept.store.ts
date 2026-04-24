import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ConceptWithLanguages, Concept } from '@termbase/shared';
import type { CreateConceptInput, UpdateConceptInput } from '@termbase/shared';
import { conceptApi } from '../api/concept.api.js';

export const useConceptStore = defineStore('concept', () => {
  const concepts = ref<ConceptWithLanguages[]>([]);
  const currentConcept = ref<ConceptWithLanguages | null>(null);
  const loading = ref(false);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(20);

  async function fetchConcepts(search?: string) {
    loading.value = true;
    const res = await conceptApi.list({ page: page.value, pageSize: pageSize.value, search });
    if (res.success && res.data) {
      concepts.value = res.data;
      total.value = res.meta?.total ?? 0;
    }
    loading.value = false;
  }

  async function fetchConcept(id: number) {
    loading.value = true;
    const res = await conceptApi.getById(id);
    if (res.success && res.data) {
      currentConcept.value = res.data;
    }
    loading.value = false;
  }

  async function createConcept(data: CreateConceptInput) {
    const res = await conceptApi.create(data);
    if (res.success) {
      await fetchConcepts();
    }
    return res;
  }

  async function updateConcept(id: number, data: UpdateConceptInput) {
    const res = await conceptApi.update(id, data);
    if (res.success && res.data && currentConcept.value) {
      currentConcept.value = { ...currentConcept.value, ...res.data };
    }
    return res;
  }

  async function deleteConcept(id: number) {
    const res = await conceptApi.delete(id);
    if (res.success) {
      concepts.value = concepts.value.filter((c) => c.id !== id);
    }
    return res;
  }

  return {
    concepts,
    currentConcept,
    loading,
    total,
    page,
    pageSize,
    fetchConcepts,
    fetchConcept,
    createConcept,
    updateConcept,
    deleteConcept,
  };
});
