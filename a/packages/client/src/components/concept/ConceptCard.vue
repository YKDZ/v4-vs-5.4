<script setup lang="ts">
import type { ConceptWithLanguages } from '@termbase/shared';

const props = defineProps<{
  concept: ConceptWithLanguages;
}>();

const emit = defineEmits<{
  delete: [id: number];
}>();

const termCount = computed(() => {
  let count = 0;
  for (const ls of props.concept.languageSections ?? []) {
    count += ls.termEntries?.length ?? 0;
  }
  return count;
});

const languages = computed(() => {
  return (props.concept.languageSections ?? []).map((ls) => ls.languageCode).join(', ');
});
</script>

<script lang="ts">
import { computed } from 'vue';
export default { name: 'ConceptCard' };
</script>

<template>
  <div class="concept-card">
    <div class="card-header">
      <h3 class="card-title">
        <router-link :to="`/concepts/${concept.id}`">
          {{ concept.subjectField || '(未分类)' }}
        </router-link>
      </h3>
      <span class="card-id">#{{ concept.id }}</span>
    </div>
    <p class="card-definition">{{ concept.definition || '暂无定义' }}</p>
    <div class="card-meta">
      <span>{{ termCount }} 个术语</span>
      <span v-if="languages">语言: {{ languages }}</span>
      <span>更新于 {{ new Date(concept.updatedAt).toLocaleDateString('zh-CN') }}</span>
    </div>
    <div class="card-actions">
      <router-link :to="`/concepts/${concept.id}`" class="btn btn-sm">查看</router-link>
      <button class="btn btn-sm btn-danger" @click="emit('delete', concept.id)">删除</button>
    </div>
  </div>
</template>

<style scoped>
.concept-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  transition: box-shadow 0.2s;
}
.concept-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.card-title {
  margin: 0;
  font-size: 16px;
}
.card-title a {
  color: #1a1a2e;
  text-decoration: none;
}
.card-title a:hover {
  color: #4a4ae0;
}
.card-id {
  color: #999;
  font-size: 12px;
}
.card-definition {
  color: #555;
  font-size: 14px;
  margin: 0 0 12px;
  line-height: 1.5;
}
.card-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
}
.card-actions {
  display: flex;
  gap: 8px;
}
</style>
