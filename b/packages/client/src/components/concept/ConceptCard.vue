<script setup lang="ts">
import type { ConceptListItem } from '@termbase/shared';

defineProps<{
  concept: ConceptListItem;
}>();
</script>

<template>
  <RouterLink class="card concept-card" :to="`/concepts/${concept.id}`">
    <div class="card-header">
      <strong>{{ concept.subjectField }}</strong>
      <span class="badge">{{ concept.termCount }} terms</span>
    </div>
    <p>{{ concept.definition }}</p>
    <p class="muted">Languages: {{ concept.languageCodes.join(', ') || 'None' }}</p>
  </RouterLink>
</template>
