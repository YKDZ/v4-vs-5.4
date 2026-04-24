import { defineStore } from 'pinia';
import { ref } from 'vue';
import { conceptApi } from '@/api/concept.api';
import type { Concept, ConceptWithDetails } from '@termbase/shared';

export const useConceptStore = defineStore('concept', () => {
  const list = ref<Concept[]>([]);
  const total = ref(0);
  const current = ref<ConceptWithDetails | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchList(params: { page?: number; pageSize?: number; q?: string; lang?: string } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await conceptApi.list(params);
      list.value = res.data ?? [];
      total.value = res.meta?.total ?? 0;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const res = await conceptApi.get(id);
      current.value = res.data ?? null;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  return { list, total, current, loading, error, fetchList, fetchOne };
});
