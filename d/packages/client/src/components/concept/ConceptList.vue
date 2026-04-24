<script setup lang="ts">
import type { ConceptListItem } from "@termbase/shared";

import ConceptCard from "./ConceptCard.vue";

defineProps<{
  concepts: ConceptListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
}>();

const emit = defineEmits<{
  open: [id: number];
  remove: [id: number];
  pageChange: [page: number];
}>();
</script>

<template>
  <section>
    <p v-if="loading">加载中...</p>
    <div v-else class="grid-list">
      <ConceptCard
        v-for="item in concepts"
        :key="item.id"
        :concept="item"
        @open="emit('open', $event)"
        @remove="emit('remove', $event)"
      />
      <p v-if="concepts.length === 0" class="muted">暂无数据</p>
    </div>

    <div class="row justify-between mt-16">
      <span class="muted">总数：{{ total }}</span>
      <div class="row gap-8">
        <button :disabled="page <= 1" @click="emit('pageChange', page - 1)">上一页</button>
        <span>第 {{ page }} 页</span>
        <button :disabled="page * pageSize >= total" @click="emit('pageChange', page + 1)">
          下一页
        </button>
      </div>
    </div>
  </section>
</template>
