<script setup lang="ts">
import type { ConceptListItem } from '@termbase/shared';
import ConceptCard from './ConceptCard.vue';

defineProps<{
  concepts: ConceptListItem[];
  loading: boolean;
}>();
</script>

<template>
  <div class="stack-md">
    <div v-if="loading" class="card">Loading concepts...</div>
    <div v-else-if="concepts.length === 0" class="card">No concepts found.</div>
    <div v-else class="grid two-columns">
      <ConceptCard v-for="concept in concepts" :key="concept.id" :concept="concept" />
    </div>
  </div>
</template>
