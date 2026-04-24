<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConceptStore } from '../stores/concept.store.js';
import ConceptCard from '../components/concept/ConceptCard.vue';
import ConceptForm from '../components/concept/ConceptForm.vue';

const store = useConceptStore();
const search = ref('');

onMounted(() => {
  store.fetchConcepts();
});

async function onSearch() {
  store.page = 1;
  await store.fetchConcepts(search.value || undefined);
}

async function onCreateConcept(data: { definition?: string; subjectField?: string; note?: string }) {
  await store.createConcept(data);
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2>概念管理</h2>
      <div class="search-bar">
        <input
          v-model="search"
          class="input"
          placeholder="搜索概念..."
          @keyup.enter="onSearch"
        />
        <button class="btn btn-primary" @click="onSearch">搜索</button>
      </div>
    </div>

    <ConceptForm @create="onCreateConcept" />

    <div v-if="store.loading" class="loading">加载中...</div>

    <div v-else-if="store.concepts.length === 0" class="empty">
      暂无概念，点击上方按钮创建第一个概念。
    </div>

    <div v-else class="concept-grid">
      <ConceptCard
        v-for="concept in store.concepts"
        :key="concept.id"
        :concept="concept"
        @delete="(id) => store.deleteConcept(id)"
      />
    </div>

    <div v-if="store.total > store.pageSize" class="pagination">
      <button
        class="btn btn-sm"
        :disabled="store.page <= 1"
        @click="store.page--; store.fetchConcepts()"
      >
        上一页
      </button>
      <span class="page-info">
        {{ store.page }} / {{ Math.ceil(store.total / store.pageSize) }}
      </span>
      <button
        class="btn btn-sm"
        :disabled="store.page >= Math.ceil(store.total / store.pageSize)"
        @click="store.page++; store.fetchConcepts()"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-header h2 {
  margin: 0;
}
.search-bar {
  display: flex;
  gap: 8px;
}
.search-bar .input {
  width: 240px;
}
.concept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.loading, .empty {
  text-align: center;
  padding: 48px;
  color: #999;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}
.page-info {
  font-size: 13px;
  color: #666;
}
</style>
