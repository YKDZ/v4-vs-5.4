<script setup lang="ts">
import type { CreateTermEntryInput, TermEntry, UpdateTermEntryInput } from '@termbase/shared';
import { reactive } from 'vue';

const props = defineProps<{
  languageCode: string;
  initialValue?: Partial<TermEntry>;
  mode: 'create' | 'edit';
  submitting?: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: CreateTermEntryInput | UpdateTermEntryInput];
  cancel: [];
}>();

const form = reactive({
  termText: props.initialValue?.termText ?? '',
  partOfSpeech: props.initialValue?.partOfSpeech ?? '',
  termType: props.initialValue?.termType ?? 'fullForm',
  status: props.initialValue?.status ?? 'preferred',
  contextExample: props.initialValue?.contextExample ?? '',
  definitionOverride: props.initialValue?.definitionOverride ?? '',
  source: props.initialValue?.source ?? '',
});

function onSubmit() {
  const payload = {
    ...(props.mode === 'create' ? { languageCode: props.languageCode } : {}),
    termText: form.termText,
    partOfSpeech: form.partOfSpeech || null,
    termType: form.termType as 'fullForm' | 'acronym' | 'abbreviation' | 'variant',
    status: form.status as 'preferred' | 'admitted' | 'deprecated',
    contextExample: form.contextExample || null,
    definitionOverride: form.definitionOverride || null,
    source: form.source || null,
  };

  emit('submit', payload);
}
</script>

<template>
  <form class="card form-grid compact" @submit.prevent="onSubmit">
    <div class="field">
      <label>Term text</label>
      <input v-model="form.termText" required />
    </div>

    <div class="field two-up">
      <div>
        <label>Part of speech</label>
        <input v-model="form.partOfSpeech" />
      </div>
      <div>
        <label>Status</label>
        <select v-model="form.status">
          <option value="preferred">preferred</option>
          <option value="admitted">admitted</option>
          <option value="deprecated">deprecated</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label>Term type</label>
      <select v-model="form.termType">
        <option value="fullForm">fullForm</option>
        <option value="acronym">acronym</option>
        <option value="abbreviation">abbreviation</option>
        <option value="variant">variant</option>
      </select>
    </div>

    <div class="field">
      <label>Context example</label>
      <textarea v-model="form.contextExample" rows="2" />
    </div>

    <div class="field">
      <label>Definition override</label>
      <textarea v-model="form.definitionOverride" rows="2" />
    </div>

    <div class="field">
      <label>Source</label>
      <input v-model="form.source" />
    </div>

    <div class="actions">
      <button type="submit" :disabled="submitting">{{ mode === 'create' ? 'Add term' : 'Save term' }}</button>
      <button type="button" class="secondary" @click="emit('cancel')">Cancel</button>
    </div>
  </form>
</template>
