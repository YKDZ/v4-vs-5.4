<template>
  <div class="card">
    <div class="row">
      <div>
        <div style="font-weight: 600">#{{ concept.id }} {{ concept.subjectField || 'Untitled' }}</div>
        <div class="muted">{{ concept.definition || '(no definition)' }}</div>
      </div>
      <div style="flex: 0 0 auto">
        <RouterLink :to="`/concepts/${concept.id}`">
          <button>Open</button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Concept } from '@termbase/shared';
defineProps<{ concept: Concept }>();
</script>
