<script setup lang="ts">
import type { CreateConceptInput, UpdateConceptInput } from '@termbase/shared';
import { computed, reactive } from 'vue';

const props = defineProps<{
  mode: 'create' | 'edit';
  initialValue?: {
    definition?: string;
    subjectField?: string;
    note?: string | null;
  };
  submitting?: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: CreateConceptInput | UpdateConceptInput];
  cancel: [];
}>();

const form = reactive({
  definition: props.initialValue?.definition ?? '',
  subjectField: props.initialValue?.subjectField ?? '',
  note: props.initialValue?.note ?? '',
  languageCode: 'en',
  termText: '',
  partOfSpeech: '',
  termType: 'fullForm',
  status: 'preferred',
});

const submitLabel = computed(() => (props.mode === 'create' ? 'Create concept' : 'Save changes'));

function onSubmit() {
  if (props.mode === 'create') {
    emit('submit', {
      definition: form.definition,
      subjectField: form.subjectField,
      note: form.note || null,
      languageSections: [
        {
          languageCode: form.languageCode,
          termEntries: [
            {
              termText: form.termText,
              partOfSpeech: form.partOfSpeech || null,
              termType: form.termType as 'fullForm' | 'acronym' | 'abbreviation' | 'variant',
              status: form.status as 'preferred' | 'admitted' | 'deprecated',
              contextExample: null,
              definitionOverride: null,
              source: null,
            },
          ],
        },
      ],
    });
    return;
  }

  emit('submit', {
    definition: form.definition,
    subjectField: form.subjectField,
    note: form.note || null,
  });
}
</script>

<template>
  <form class="card form-grid" @submit.prevent="onSubmit">
    <div class="field">
      <label for="definition">Definition</label>
      <textarea id="definition" v-model="form.definition" rows="3" required />
    </div>

    <div class="field">
      <label for="subject-field">Subject field</label>
      <input id="subject-field" v-model="form.subjectField" required />
    </div>

    <div class="field">
      <label for="concept-note">Note</label>
      <textarea id="concept-note" v-model="form.note" rows="2" />
    </div>

    <template v-if="mode === 'create'">
      <div class="field">
        <label for="language-code">Initial language</label>
        <input id="language-code" v-model="form.languageCode" required />
      </div>

      <div class="field">
        <label for="term-text">Initial term</label>
        <input id="term-text" v-model="form.termText" required />
      </div>

      <div class="field two-up">
        <div>
          <label for="part-of-speech">Part of speech</label>
          <input id="part-of-speech" v-model="form.partOfSpeech" />
        </div>
        <div>
          <label for="term-type">Term type</label>
          <select id="term-type" v-model="form.termType">
            <option value="fullForm">fullForm</option>
            <option value="acronym">acronym</option>
            <option value="abbreviation">abbreviation</option>
            <option value="variant">variant</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="status">Status</label>
        <select id="status" v-model="form.status">
          <option value="preferred">preferred</option>
          <option value="admitted">admitted</option>
          <option value="deprecated">deprecated</option>
        </select>
      </div>
    </template>

    <div class="actions">
      <button type="submit" :disabled="submitting">{{ submitLabel }}</button>
      <button type="button" class="secondary" @click="emit('cancel')">Cancel</button>
    </div>
  </form>
</template>
