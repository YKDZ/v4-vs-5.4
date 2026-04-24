<template>
  <div class="card">
    <h4 style="margin-top: 0">Language: {{ section.languageCode }}</h4>
    <table>
      <thead>
        <tr>
          <th>Term</th>
          <th>Type</th>
          <th>Status</th>
          <th>Source</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <TermEntryRow v-for="t in section.termEntries" :key="t.id" :term="t" @updated="$emit('updated')" @deleted="$emit('deleted')" />
        <tr v-if="section.termEntries.length === 0"><td colspan="5" class="muted">No terms.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { LanguageSectionWithTerms } from '@termbase/shared';
import TermEntryRow from './TermEntryRow.vue';
defineProps<{ section: LanguageSectionWithTerms }>();
defineEmits<{ (e: 'updated'): void; (e: 'deleted'): void }>();
</script>
