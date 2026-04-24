<script setup lang="ts">
import type { CreateTermEntryInput, UpdateConceptInput, UpdateTermEntryInput } from '@termbase/shared';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConceptInfo from '../components/concept/ConceptInfo.vue';
import LanguageSection from '../components/term/LanguageSection.vue';
import { useConceptStore } from '../stores/concept.store';

const route = useRoute();
const router = useRouter();
const store = useConceptStore();
const filterText = ref('');

const conceptId = computed(() => Number(route.params.id));

async function loadConcept() {
  if (!Number.isInteger(conceptId.value)) {
    return;
  }

  await store.loadConcept(conceptId.value);
}

async function updateConcept(payload: UpdateConceptInput) {
  await store.updateConcept(conceptId.value, payload);
}

async function removeConcept() {
  await store.deleteConcept(conceptId.value);
  await router.push('/concepts');
}

async function createTerm(payload: CreateTermEntryInput) {
  await store.createTerm(conceptId.value, payload);
}

async function updateTerm(termId: number, payload: UpdateTermEntryInput) {
  await store.updateTerm(conceptId.value, termId, payload);
}

async function deleteTerm(termId: number) {
  await store.deleteTerm(conceptId.value, termId);
}

watch(
  () => route.params.id,
  () => {
    void loadConcept();
  },
);

onMounted(() => {
  void loadConcept();
});
</script>

<template>
  <section class="stack-md">
    <RouterLink class="link-back" to="/concepts">← Back to concepts</RouterLink>

    <p v-if="store.error" class="error-banner">{{ store.error }}</p>

    <div v-if="store.loading && !store.currentConcept" class="card">Loading concept...</div>
    <div v-else-if="!store.currentConcept" class="card">Concept not found.</div>
    <template v-else>
      <ConceptInfo :concept="store.currentConcept" :submitting="store.loading" @update="updateConcept" @delete="removeConcept" />

      <div class="card toolbar">
        <input v-model="filterText" placeholder="Filter terms by text" />
      </div>

      <div class="grid two-columns">
        <LanguageSection
          v-for="section in store.currentConcept.languageSections"
          :key="section.id"
          :section="section"
          :submitting="store.loading"
          :filter-text="filterText"
          @create="createTerm"
          @update="updateTerm"
          @delete="deleteTerm"
        />
      </div>
    </template>
  </section>
</template>
