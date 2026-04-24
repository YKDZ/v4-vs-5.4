<script setup lang="ts">
import type { CreateTermEntryPayload, TermEntry, UpdateTermEntryPayload } from "@termbase/shared";
import { ref } from "vue";

import TermEntryForm from "./TermEntryForm.vue";
import TermEntryRow from "./TermEntryRow.vue";

defineProps<{
  languageCode: string;
  terms: TermEntry[];
}>();

const emit = defineEmits<{
  create: [payload: CreateTermEntryPayload];
  update: [termId: number, payload: UpdateTermEntryPayload];
  remove: [termId: number];
}>();

const editingTerm = ref<TermEntry | null>(null);

function handleUpdate(termId: number, payload: UpdateTermEntryPayload) {
  emit("update", termId, payload);
}
</script>

<template>
  <section class="card">
    <h3>语言段：{{ languageCode }}</h3>
    <table class="table">
      <thead>
        <tr>
          <th>术语</th>
          <th>状态</th>
          <th>词性</th>
          <th>类型</th>
          <th>来源</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <TermEntryRow
          v-for="term in terms"
          :key="term.id"
          :term="term"
          @edit="editingTerm = $event"
          @remove="emit('remove', $event)"
        />
        <tr v-if="terms.length === 0">
          <td colspan="6" class="muted">暂无术语</td>
        </tr>
      </tbody>
    </table>
    <TermEntryForm
      :language-code="languageCode"
      :editing-term="editingTerm"
      @create="emit('create', $event)"
      @update="handleUpdate"
      @cancel-edit="editingTerm = null"
    />
  </section>
</template>
