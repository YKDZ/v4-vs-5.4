<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  languageCode: string;
}>();

const emit = defineEmits<{
  submit: [data: Record<string, unknown>];
}>();

const termText = ref('');
const partOfSpeech = ref('');
const termType = ref('fullForm');
const status = ref('preferred');
const contextExample = ref('');
const source = ref('');

function submit() {
  if (!termText.value.trim()) return;
  emit('submit', {
    languageCode: props.languageCode,
    termText: termText.value.trim(),
    partOfSpeech: partOfSpeech.value || undefined,
    termType: termType.value,
    status: status.value,
    contextExample: contextExample.value || undefined,
    source: source.value || undefined,
  });
  termText.value = '';
  partOfSpeech.value = '';
  contextExample.value = '';
  source.value = '';
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <input v-model="termText" class="input" placeholder="术语文本 (必填)" />
    <input v-model="partOfSpeech" class="input" placeholder="词性 (如: noun)" />
    <select v-model="termType" class="input">
      <option value="fullForm">完整形式</option>
      <option value="acronym">首字母缩写</option>
      <option value="abbreviation">缩写</option>
      <option value="variant">变体</option>
    </select>
    <select v-model="status" class="input">
      <option value="preferred">首选</option>
      <option value="admitted">允许</option>
      <option value="deprecated">禁用</option>
    </select>
    <input v-model="contextExample" class="input" placeholder="语境示例..." />
    <input v-model="source" class="input" placeholder="来源..." />
    <button type="submit" class="btn btn-primary btn-sm" :disabled="!termText.trim()">
      添加
    </button>
  </form>
</template>

<style scoped>
.add-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #fff;
  border: 1px dashed #ccc;
  border-radius: 6px;
}
.add-form .input {
  flex: 1;
  min-width: 120px;
}
</style>
