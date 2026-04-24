<template>
  <div v-if="store.loading" class="empty">Loading…</div>
  <div v-else-if="!store.current" class="empty status-error">Concept not found.</div>
  <div v-else>
    <div class="row">
      <h2 style="margin: 8px 0">Concept #{{ store.current.id }}</h2>
      <div style="flex: 0 0 auto">
        <button @click="goBack">← Back</button>
        <button class="danger" @click="onDelete">Delete</button>
      </div>
    </div>

    <div class="card">
      <div class="field"><label>Definition</label><textarea v-model="form.definition" /></div>
      <div class="grid-2">
        <div class="field"><label>Subject field</label><input v-model="form.subjectField" /></div>
        <div class="field"><label>Note</label><input v-model="form.note" /></div>
      </div>
      <button class="primary" @click="save">Save concept</button>
    </div>

    <h3>Language sections</h3>
    <div class="card">
      <form class="row" @submit.prevent="addTerm">
        <div class="field"><label>Language</label><input v-model="newTerm.languageCode" placeholder="en / zh-CN" required /></div>
        <div class="field"><label>Term</label><input v-model="newTerm.termText" required /></div>
        <div class="field">
          <label>Status</label>
          <select v-model="newTerm.status">
            <option :value="null">(none)</option>
            <option value="preferred">preferred</option>
            <option value="admitted">admitted</option>
            <option value="deprecated">deprecated</option>
          </select>
        </div>
        <div class="field">
          <label>Type</label>
          <select v-model="newTerm.termType">
            <option :value="null">(none)</option>
            <option value="fullForm">fullForm</option>
            <option value="acronym">acronym</option>
            <option value="abbreviation">abbreviation</option>
            <option value="variant">variant</option>
          </select>
        </div>
        <div class="field" style="flex: 0 0 auto">
          <label>&nbsp;</label>
          <button class="primary" type="submit">Add term</button>
        </div>
      </form>
    </div>

    <LanguageSection
      v-for="s in store.current.languageSections"
      :key="s.id"
      :section="s"
      @updated="refresh"
      @deleted="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConceptStore } from '@/stores/concept.store';
import { conceptApi } from '@/api/concept.api';
import { termApi } from '@/api/term-entry.api';
import LanguageSection from '@/components/term/LanguageSection.vue';

const route = useRoute();
const router = useRouter();
const store = useConceptStore();

const form = reactive({ definition: '', subjectField: '', note: '' });
const newTerm = reactive({
  languageCode: 'en',
  termText: '',
  status: null as null | 'preferred' | 'admitted' | 'deprecated',
  termType: null as null | 'fullForm' | 'acronym' | 'abbreviation' | 'variant',
});

async function refresh() {
  const id = Number(route.params.id);
  await store.fetchOne(id);
  if (store.current) {
    form.definition = store.current.definition ?? '';
    form.subjectField = store.current.subjectField ?? '';
    form.note = store.current.note ?? '';
  }
}

async function save() {
  if (!store.current) return;
  await conceptApi.update(store.current.id, {
    definition: form.definition || null,
    subjectField: form.subjectField || null,
    note: form.note || null,
  });
  await refresh();
}

async function onDelete() {
  if (!store.current) return;
  if (!confirm('Delete this concept?')) return;
  await conceptApi.remove(store.current.id);
  router.push('/concepts');
}

async function addTerm() {
  if (!store.current) return;
  await termApi.add(store.current.id, {
    languageCode: newTerm.languageCode,
    termText: newTerm.termText,
    status: newTerm.status,
    termType: newTerm.termType,
  });
  newTerm.termText = '';
  await refresh();
}

function goBack() { router.push('/concepts'); }

watch(() => route.params.id, refresh);
onMounted(refresh);
</script>
