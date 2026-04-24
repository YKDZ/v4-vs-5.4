<script setup lang="ts">
import type { LanguageSectionWithTerms } from '@termbase/shared';
import TermEntryRow from './TermEntryRow.vue';
import TermEntryForm from './TermEntryForm.vue';
import { ref } from 'vue';

const props = defineProps<{
  section: LanguageSectionWithTerms;
}>();

const emit = defineEmits<{
  addTerm: [languageCode: string, data: Record<string, unknown>];
  updateTerm: [id: number, data: Record<string, unknown>];
  deleteTerm: [id: number];
}>();

const showForm = ref(false);

function onAddTerm(data: Record<string, unknown>) {
  emit('addTerm', props.section.languageCode, data);
  showForm.value = false;
}
</script>

<template>
  <div class="language-section">
    <div class="section-header">
      <h3>{{ section.languageCode }}</h3>
      <button class="btn btn-sm btn-primary" @click="showForm = !showForm">
        {{ showForm ? '取消' : '+ 添加术语' }}
      </button>
    </div>

    <TermEntryForm
      v-if="showForm"
      :language-code="section.languageCode"
      @submit="onAddTerm"
    />

    <div v-if="section.termEntries?.length" class="term-list">
      <TermEntryRow
        v-for="term in section.termEntries"
        :key="term.id"
        :term="term"
        @update="(d) => emit('updateTerm', term.id, d)"
        @delete="emit('deleteTerm', term.id)"
      />
    </div>
    <p v-else class="empty-text">暂无术语条目</p>
  </div>
</template>

<style scoped>
.language-section {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fafbfc;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}
.term-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.empty-text {
  color: #aaa;
  font-size: 13px;
  font-style: italic;
}
</style>
