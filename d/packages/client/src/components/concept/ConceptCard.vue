<script setup lang="ts">
import type { ConceptListItem } from "@termbase/shared";

defineProps<{
  concept: ConceptListItem;
}>();

const emit = defineEmits<{
  open: [id: number];
  remove: [id: number];
}>();
</script>

<template>
  <article class="card">
    <h3>{{ concept.definition }}</h3>
    <p class="muted">{{ concept.subjectField || "未设置领域" }}</p>
    <p class="muted">{{ concept.note || "无备注" }}</p>
    <div class="row gap-8">
      <button @click="emit('open', concept.id)">查看详情</button>
      <button class="danger" @click="emit('remove', concept.id)">删除</button>
    </div>
  </article>
</template>
