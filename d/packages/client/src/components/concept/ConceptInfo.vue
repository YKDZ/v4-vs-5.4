<script setup lang="ts">
import type { Concept } from "@termbase/shared";

defineProps<{
  concept: Concept;
}>();
</script>

<template>
  <section class="card">
    <h2>概念信息</h2>
    <p><strong>定义：</strong>{{ concept.definition }}</p>
    <p><strong>领域：</strong>{{ concept.subjectField || "未设置" }}</p>
    <p><strong>备注：</strong>{{ concept.note || "无" }}</p>
    <p class="muted"><strong>UUID：</strong>{{ concept.uuid }}</p>
  </section>
</template>
