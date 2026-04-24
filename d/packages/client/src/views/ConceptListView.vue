<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import ConceptForm from "../components/concept/ConceptForm.vue";
import ConceptList from "../components/concept/ConceptList.vue";
import { useConceptStore } from "../stores/concept.store";

const conceptStore = useConceptStore();
const router = useRouter();

onMounted(async () => {
  await conceptStore.loadConcepts();
});

async function handleCreate(payload: {
  definition: string;
  subjectField?: string;
  note?: string;
}) {
  await conceptStore.addConcept(payload);
}

async function handleSearch() {
  conceptStore.page = 1;
  await conceptStore.loadConcepts();
}

async function handleDelete(id: number) {
  await conceptStore.removeConcept(id);
}

async function handlePageChange(nextPage: number) {
  conceptStore.page = nextPage;
  await conceptStore.loadConcepts();
}
</script>

<template>
  <section class="page">
    <h2>概念列表</h2>
    <div class="row gap-8 mt-16">
      <input
        v-model="conceptStore.keyword"
        placeholder="输入关键词搜索定义/领域/备注"
        class="flex-1"
      />
      <button @click="handleSearch">搜索</button>
    </div>

    <ConceptForm submit-label="创建概念" @submit="handleCreate" />

    <ConceptList
      :concepts="conceptStore.concepts"
      :loading="conceptStore.loading"
      :page="conceptStore.page"
      :page-size="conceptStore.pageSize"
      :total="conceptStore.total"
      @open="router.push(`/concepts/${$event}`)"
      @remove="handleDelete"
      @page-change="handlePageChange"
    />

    <p v-if="conceptStore.error" class="error-text">{{ conceptStore.error }}</p>
  </section>
</template>
