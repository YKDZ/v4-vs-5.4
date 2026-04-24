<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConceptStore } from '../stores/concept.store.js';
import ConceptInfo from '../components/concept/ConceptInfo.vue';
import LanguageSection from '../components/term/LanguageSection.vue';
import TermEntryForm from '../components/term/TermEntryForm.vue';
import type { CreateTermEntryInput, UpdateConceptInput, UpdateTermEntryInput } from '@termbase/shared';
import { termEntryApi } from '../api/term-entry.api.js';

const route = useRoute();
const router = useRouter();
const store = useConceptStore();

const conceptId = computed(() => Number(route.params.id));

onMounted(() => {
  if (conceptId.value) {
    store.fetchConcept(conceptId.value);
  }
});

watch(conceptId, (id) => {
  if (id) store.fetchConcept(id);
});

async function onUpdateConcept(data: { definition?: string | null; subjectField?: string | null; note?: string | null }) {
  // Remove null values for UpdateConceptInput compatibility
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== null),
  ) as Record<string, string>;
  await store.updateConcept(conceptId.value, clean as UpdateConceptInput);
}

async function onAddTerm(languageCode: string, data: Record<string, unknown>) {
  await termEntryApi.create(conceptId.value, {
    ...data,
    languageCode,
  } as CreateTermEntryInput);
  await store.fetchConcept(conceptId.value);
}

async function onUpdateTerm(id: number, data: Record<string, unknown>) {
  await termEntryApi.update(id, data as UpdateTermEntryInput);
  await store.fetchConcept(conceptId.value);
}

async function onDeleteTerm(id: number) {
  if (!confirm('确定删除此术语条目？')) return;
  await termEntryApi.delete(id);
  await store.fetchConcept(conceptId.value);
}
</script>

<template>
  <div class="page">
    <button class="btn btn-back" @click="router.push('/concepts')">← 返回列表</button>

    <div v-if="store.loading" class="loading">加载中...</div>

    <template v-else-if="store.currentConcept">
      <ConceptInfo
        :concept="store.currentConcept"
        @update="onUpdateConcept"
      />

      <div class="terms-section">
        <h2>术语条目</h2>
        <LanguageSection
          v-for="section in store.currentConcept.languageSections"
          :key="section.id"
          :section="section"
          @add-term="onAddTerm"
          @update-term="onUpdateTerm"
          @delete-term="onDeleteTerm"
        />
        <p v-if="!store.currentConcept.languageSections?.length" class="empty-text">
          暂无术语条目。使用下方表单添加术语。
        </p>

        <div v-if="!store.currentConcept.languageSections?.length" class="quick-add">
          <h3>快速添加术语</h3>
          <TermEntryForm
            language-code="zh-CN"
            @submit="onAddTerm('zh-CN', $event)"
          />
        </div>
      </div>
    </template>

    <div v-else class="error">概念未找到。</div>
  </div>
</template>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}
.btn-back {
  margin-bottom: 16px;
}
.terms-section {
  margin-top: 24px;
}
.terms-section h2 {
  margin: 0 0 16px;
  font-size: 18px;
}
.loading, .error, .empty-text {
  text-align: center;
  padding: 48px;
  color: #999;
}
.quick-add {
  margin-top: 16px;
}
.quick-add h3 {
  margin: 0 0 8px;
}
</style>
