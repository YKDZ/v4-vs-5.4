<script setup lang="ts">
import type { CreateConceptInput, UpdateConceptInput } from '@termbase/shared';
import { onMounted, ref } from 'vue';
import ConceptForm from '../components/concept/ConceptForm.vue';
import ConceptList from '../components/concept/ConceptList.vue';
import { useConceptStore } from '../stores/concept.store';

const store = useConceptStore();
const showCreateForm = ref(false);
const searchDraft = ref(store.search);

function isCreateConceptPayload(payload: CreateConceptInput | UpdateConceptInput): payload is CreateConceptInput {
  return Array.isArray((payload as CreateConceptInput).languageSections);
}

async function refresh(page = 1) {
  await store.loadConcepts({ page, pageSize: store.meta.pageSize, search: store.search });
}

async function submitCreate(payload: CreateConceptInput | UpdateConceptInput) {
  if (isCreateConceptPayload(payload)) {
    await store.createConcept(payload);
    showCreateForm.value = false;
  }
}

async function onSearch() {
  store.search = searchDraft.value;
  await refresh(1);
}

onMounted(() => {
  void refresh();
});
</script>

<template>
  <section class="stack-md">
    <div class="page-header">
      <div>
        <h2>Concept library</h2>
        <p class="muted">Manage concept-oriented terminology across languages.</p>
      </div>
      <button @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? 'Close create form' : 'Create concept' }}
      </button>
    </div>

    <div class="card toolbar">
      <input v-model="searchDraft" placeholder="Search by definition or subject field" />
      <button class="secondary" @click="onSearch">Search</button>
      <button class="secondary" @click="searchDraft = ''; store.search = ''; refresh(1)">Reset</button>
    </div>

    <ConceptForm v-if="showCreateForm" mode="create" @submit="submitCreate" @cancel="showCreateForm = false" />

    <p v-if="store.error" class="error-banner">{{ store.error }}</p>

    <ConceptList :concepts="store.concepts" :loading="store.loading" />

    <div class="pagination">
      <button class="secondary" :disabled="store.meta.page <= 1" @click="refresh(store.meta.page - 1)">Previous</button>
      <span>Page {{ store.meta.page }} / {{ Math.max(1, Math.ceil(store.meta.total / store.meta.pageSize)) }}</span>
      <button
        class="secondary"
        :disabled="store.meta.page * store.meta.pageSize >= store.meta.total"
        @click="refresh(store.meta.page + 1)"
      >
        Next
      </button>
    </div>
  </section>
</template>
