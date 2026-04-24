<script setup lang="ts">
import type { CreateTermEntryInput, LanguageSection, UpdateTermEntryInput } from '@termbase/shared';
import { computed, ref } from 'vue';
import TermEntryForm from './TermEntryForm.vue';
import TermEntryRow from './TermEntryRow.vue';

const props = defineProps<{
  section: LanguageSection;
  submitting?: boolean;
  filterText?: string;
}>();

const emit = defineEmits<{
  create: [payload: CreateTermEntryInput];
  update: [termId: number, payload: UpdateTermEntryInput];
  delete: [termId: number];
}>();

const creating = ref(false);

const filteredTerms = computed(() => {
  const keyword = props.filterText?.trim().toLowerCase();
  if (!keyword) {
    return props.section.termEntries;
  }

  return props.section.termEntries.filter((term) => term.termText.toLowerCase().includes(keyword));
});

function handleCreate(payload: CreateTermEntryInput | UpdateTermEntryInput) {
  if ('languageCode' in payload) {
    creating.value = false;
    emit('create', payload);
  }
}
</script>

<template>
  <section class="card stack-md">
    <div class="card-header">
      <div>
        <h3>{{ section.languageCode }}</h3>
        <p class="muted">{{ section.termEntries.length }} terms</p>
      </div>
      <button class="secondary" @click="creating = !creating">
        {{ creating ? 'Close term form' : 'Add term' }}
      </button>
    </div>

    <TermEntryForm
      v-if="creating"
      :language-code="section.languageCode"
      mode="create"
      :submitting="submitting"
      @submit="handleCreate"
      @cancel="creating = false"
    />

    <div v-if="filteredTerms.length === 0" class="muted">No terms match this filter.</div>
    <div v-else class="stack-sm">
      <TermEntryRow
        v-for="term in filteredTerms"
        :key="term.id"
        :term="term"
        :language-code="section.languageCode"
        :submitting="submitting"
        @update="emit('update', term.id, $event)"
        @delete="emit('delete', term.id)"
      />
    </div>
  </section>
</template>
