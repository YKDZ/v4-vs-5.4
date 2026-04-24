<script setup lang="ts">
import type { TermEntry } from "@termbase/shared";

defineProps<{
  term: TermEntry;
}>();

const emit = defineEmits<{
  edit: [term: TermEntry];
  remove: [id: number];
}>();
</script>

<template>
  <tr>
    <td>{{ term.termText }}</td>
    <td>{{ term.status }}</td>
    <td>{{ term.partOfSpeech || "-" }}</td>
    <td>{{ term.termType || "-" }}</td>
    <td>{{ term.source || "-" }}</td>
    <td class="row gap-8">
      <button @click="emit('edit', term)">编辑</button>
      <button class="danger" @click="emit('remove', term.id)">删除</button>
    </td>
  </tr>
</template>
