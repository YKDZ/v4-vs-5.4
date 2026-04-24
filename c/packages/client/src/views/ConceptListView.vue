<template>
  <div>
    <div class="card">
      <form class="row" @submit.prevent="onSubmit">
        <div class="field">
          <label>Definition</label>
          <input v-model="form.definition" placeholder="Concept definition" />
        </div>
        <div class="field">
          <label>Subject field</label>
          <input v-model="form.subjectField" placeholder="e.g., Software Engineering" />
        </div>
        <div class="field" style="flex: 0 0 auto">
          <label>&nbsp;</label>
          <button class="primary" type="submit">Create concept</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="row">
        <div class="field">
          <label>Search</label>
          <input v-model="query" placeholder="Search concepts or terms…" @keyup.enter="refresh" />
        </div>
        <div class="field">
          <label>Language</label>
          <input v-model="langFilter" placeholder="e.g., en or zh-CN" @keyup.enter="refresh" />
        </div>
        <div class="field" style="flex: 0 0 auto">
          <label>&nbsp;</label>
          <button @click="refresh">Apply</button>
        </div>
      </div>
    </div>

    <div v-if="store.loading" class="empty">Loading…</div>
    <div v-else-if="store.error" class="empty status-error">{{ store.error }}</div>
    <div v-else-if="store.list.length === 0" class="empty">No concepts yet.</div>
    <div v-else>
      <ConceptCard v-for="c in store.list" :key="c.id" :concept="c" />
      <div class="pagination">
        <button :disabled="page <= 1" @click="prev">Prev</button>
        <span class="muted">Page {{ page }} / {{ totalPages }} ({{ store.total }} items)</span>
        <button :disabled="page >= totalPages" @click="next">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useConceptStore } from '@/stores/concept.store';
import { conceptApi } from '@/api/concept.api';
import ConceptCard from '@/components/concept/ConceptCard.vue';

const store = useConceptStore();
const page = ref(1);
const pageSize = 10;
const query = ref('');
const langFilter = ref('');

const form = reactive({ definition: '', subjectField: '' });

const totalPages = computed(() => Math.max(1, Math.ceil(store.total / pageSize)));

async function refresh() {
  page.value = 1;
  await fetchPage();
}
async function fetchPage() {
  await store.fetchList({ page: page.value, pageSize, q: query.value || undefined, lang: langFilter.value || undefined });
}
function prev() { if (page.value > 1) { page.value--; fetchPage(); } }
function next() { if (page.value < totalPages.value) { page.value++; fetchPage(); } }

async function onSubmit() {
  if (!form.definition && !form.subjectField) return;
  await conceptApi.create({ definition: form.definition || null, subjectField: form.subjectField || null });
  form.definition = '';
  form.subjectField = '';
  await fetchPage();
}

onMounted(fetchPage);
</script>
