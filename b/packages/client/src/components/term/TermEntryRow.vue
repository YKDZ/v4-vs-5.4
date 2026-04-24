<script setup lang="ts">
import type { TermEntry, UpdateTermEntryInput } from '@termbase/shared';
import { ref } from 'vue';
import TermEntryForm from './TermEntryForm.vue';

const props = defineProps<{
  term: TermEntry;
  languageCode: string;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  update: [payload: UpdateTermEntryInput];
  delete: [];
}>();

const editing = ref(false);

function handleSubmit(payload: CreateTermPayload | UpdateTermEntryInput) {
  editing.value = false;
  emit('update', payload as UpdateTermEntryInput);
}

type CreateTermPayload = UpdateTermEntryInput & { languageCode?: never };
</script>

<template>
  <div class="card stack-sm">
    <div class="card-header">
      <div>
        <strong>{{ term.termText }}</strong>
        <p class="muted">{{ term.termType }} / {{ term.status }}</p>
      </div>
      <div class="actions">
        <button class="secondary" @click="editing = !editing">{{ editing ? 'Close' : 'Edit' }}</button>
        <button class="danger" @click="emit('delete')">Delete</button>
      </div>
    </div>

    <p class="muted">POS: {{ term.partOfSpeech || 'n/a' }}</p>
    <p class="muted">Context: {{ term.contextExample || 'n/a' }}</p>
    <p class="muted">Definition override: {{ term.definitionOverride || 'n/a' }}</p>
    <p class="muted">Source: {{ term.source || 'n/a' }}</p>

    <TermEntryForm
      v-if="editing"
      :initial-value="props.term"
      :language-code="languageCode"
      mode="edit"
      :submitting="submitting"
      @submit="handleSubmit"
      @cancel="editing = false"
    />
  </div>
</template>
