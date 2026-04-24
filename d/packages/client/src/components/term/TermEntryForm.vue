<script setup lang="ts">
import type { CreateTermEntryPayload, TermEntry, UpdateTermEntryPayload } from "@termbase/shared";
import { reactive, watch } from "vue";

const props = withDefaults(
  defineProps<{
    languageCode: string;
    editingTerm?: TermEntry | null;
  }>(),
  {
    editingTerm: null,
  },
);

const emit = defineEmits<{
  create: [payload: CreateTermEntryPayload];
  update: [termId: number, payload: UpdateTermEntryPayload];
  cancelEdit: [];
}>();

const form = reactive({
  termText: "",
  status: "preferred",
  partOfSpeech: "noun",
  termType: "fullForm",
  source: "",
});

watch(
  () => props.editingTerm,
  (term) => {
    form.termText = term?.termText ?? "";
    form.status = term?.status ?? "preferred";
    form.partOfSpeech = term?.partOfSpeech ?? "noun";
    form.termType = term?.termType ?? "fullForm";
    form.source = term?.source ?? "";
  },
  { immediate: true },
);

function buildPayload() {
  return {
    termText: form.termText.trim(),
    status: form.status as "preferred" | "admitted" | "deprecated",
    partOfSpeech: form.partOfSpeech as
      | "noun"
      | "verb"
      | "adjective"
      | "adverb"
      | "phrase"
      | "other",
    termType: form.termType as "fullForm" | "acronym" | "abbreviation" | "variant",
    source: form.source.trim() || undefined,
  };
}

function submit() {
  if (!form.termText.trim()) {
    return;
  }

  if (props.editingTerm) {
    emit("update", props.editingTerm.id, buildPayload());
    emit("cancelEdit");
    return;
  }

  emit("create", {
    languageCode: props.languageCode,
    ...buildPayload(),
  });
}
</script>

<template>
  <form class="card" @submit.prevent="submit">
    <h3>{{ editingTerm ? "编辑术语" : "新增术语" }}（{{ languageCode }}）</h3>
    <label class="field">
      <span>术语文本</span>
      <input v-model="form.termText" required />
    </label>
    <div class="row gap-8">
      <label class="field flex-1">
        <span>状态</span>
        <select v-model="form.status">
          <option value="preferred">preferred</option>
          <option value="admitted">admitted</option>
          <option value="deprecated">deprecated</option>
        </select>
      </label>
      <label class="field flex-1">
        <span>词性</span>
        <select v-model="form.partOfSpeech">
          <option value="noun">noun</option>
          <option value="verb">verb</option>
          <option value="adjective">adjective</option>
          <option value="adverb">adverb</option>
          <option value="phrase">phrase</option>
          <option value="other">other</option>
        </select>
      </label>
      <label class="field flex-1">
        <span>术语类型</span>
        <select v-model="form.termType">
          <option value="fullForm">fullForm</option>
          <option value="acronym">acronym</option>
          <option value="abbreviation">abbreviation</option>
          <option value="variant">variant</option>
        </select>
      </label>
    </div>
    <label class="field">
      <span>来源</span>
      <input v-model="form.source" />
    </label>
    <div class="row gap-8">
      <button type="submit">{{ editingTerm ? "更新术语" : "新增术语" }}</button>
      <button v-if="editingTerm" type="button" @click="emit('cancelEdit')">取消</button>
    </div>
  </form>
</template>
