import type { Concept, ConceptListItem, CreateConceptInput, UpdateConceptInput } from '@termbase/shared';
import { defineStore } from 'pinia';
import { createConcept, deleteConcept, getConcept, listConcepts, updateConcept } from '../api/concept.api';
import { createTerm, deleteTerm, updateTerm } from '../api/term-entry.api';

export const useConceptStore = defineStore('concepts', {
  state: () => ({
    concepts: [] as ConceptListItem[],
    currentConcept: null as Concept | null,
    loading: false,
    error: '' as string | null,
    meta: {
      page: 1,
      pageSize: 10,
      total: 0,
    },
    search: '',
  }),
  actions: {
    setError(message: string | null) {
      this.error = message;
    },
    async loadConcepts(params?: { page?: number; pageSize?: number; search?: string }) {
      this.loading = true;
      this.error = null;

      try {
        const response = await listConcepts({
          page: params?.page ?? this.meta.page,
          pageSize: params?.pageSize ?? this.meta.pageSize,
          search: params?.search ?? this.search,
        });

        this.concepts = response.data ?? [];
        this.meta = response.meta ?? this.meta;
        this.search = params?.search ?? this.search;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load concepts';
      } finally {
        this.loading = false;
      }
    },
    async loadConcept(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await getConcept(id);
        this.currentConcept = response.data ?? null;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load concept';
      } finally {
        this.loading = false;
      }
    },
    async createConcept(payload: CreateConceptInput) {
      this.error = null;

      try {
        const response = await createConcept(payload);
        await this.loadConcepts({ page: 1, search: this.search, pageSize: this.meta.pageSize });
        return response.data ?? null;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create concept';
        throw error;
      }
    },
    async updateConcept(id: number, payload: UpdateConceptInput) {
      this.error = null;

      try {
        const response = await updateConcept(id, payload);
        this.currentConcept = response.data ?? null;
        await this.loadConcepts({ page: this.meta.page, search: this.search, pageSize: this.meta.pageSize });
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update concept';
        throw error;
      }
    },
    async deleteConcept(id: number) {
      this.error = null;

      try {
        await deleteConcept(id);
        if (this.currentConcept?.id === id) {
          this.currentConcept = null;
        }
        await this.loadConcepts({ page: 1, search: this.search, pageSize: this.meta.pageSize });
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete concept';
        throw error;
      }
    },
    async createTerm(conceptId: number, payload: Parameters<typeof createTerm>[1]) {
      this.error = null;

      try {
        await createTerm(conceptId, payload);
        await this.loadConcept(conceptId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create term';
        throw error;
      }
    },
    async updateTerm(conceptId: number, termId: number, payload: Parameters<typeof updateTerm>[1]) {
      this.error = null;

      try {
        await updateTerm(termId, payload);
        await this.loadConcept(conceptId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update term';
        throw error;
      }
    },
    async deleteTerm(conceptId: number, termId: number) {
      this.error = null;

      try {
        await deleteTerm(termId);
        await this.loadConcept(conceptId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete term';
        throw error;
      }
    },
  },
});
