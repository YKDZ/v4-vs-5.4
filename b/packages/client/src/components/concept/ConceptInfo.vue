<script setup lang="ts">
import type { Concept, UpdateConceptInput } from '@termbase/shared';
import { ref } from 'vue';
import ConceptForm from './ConceptForm.vue';

defineProps<{
  concept: Concept;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  update: [payload: UpdateConceptInput];
  delete: [];
}>();

const editing = ref(false);

function handleSubmit(payload: CreateConceptPayload | UpdateConceptInput) {
  editing.value = false;
  emit('update', payload as UpdateConceptInput);
}

type CreateConceptPayload = UpdateConceptInput & { languageSections?: never };
</script>

<template>
  <section class="stack-sm">
    <div class="card">
      <div class="card-header">
        <div>
          <h2>{{ concept.subjectField }}</h2>
          <p>{{ concept.definition }}</p>
        </div>
        <div class="actions">
          <button class="secondary" @click="editing = !editing">
            {{ editing ? 'Close editor' : 'Edit concept' }}
          </button>
          <button class="danger" @click="emit('delete')">Delete</button>
        </div>
      </div>
      <p class="muted">UUID: {{ concept.uuid }}</p>
      <p class="muted">Note: {{ concept.note || 'No note' }}</p>
    </div>

    <ConceptForm
      v-if="editing"
      mode="edit"
      :initial-value="concept"
      :submitting="submitting"
      @submit="handleSubmit"
      @cancel="editing = false"
    />
  </section>
</template>
