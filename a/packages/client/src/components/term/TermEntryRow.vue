<script setup lang="ts">
import { ref } from 'vue';
import type { TermEntry } from '@termbase/shared';

const props = defineProps<{
  term: TermEntry;
}>();

const emit = defineEmits<{
  update: [data: Record<string, unknown>];
  delete: [];
}>();

const editing = ref(false);

const termText = ref(props.term.termText);
const partOfSpeech = ref(props.term.partOfSpeech ?? '');
const termType = ref(props.term.termType ?? 'fullForm');
const status = ref(props.term.status ?? 'preferred');
const contextExample = ref(props.term.contextExample ?? '');
const source = ref(props.term.source ?? '');

function save() {
  emit('update', {
    termText: termText.value,
    partOfSpeech: partOfSpeech.value || null,
    termType: termType.value || null,
    status: status.value || null,
    contextExample: contextExample.value || null,
    source: source.value || null,
  });
  editing.value = false;
}
</script>

<template>
  <div class="term-row" :class="{ editing }">
    <div v-if="!editing" class="term-view">
      <div class="term-main">
        <span class="term-text">{{ term.termText }}</span>
        <span class="term-badge" :class="term.status">{{ term.status }}</span>
        <span v-if="term.partOfSpeech" class="term-pos">{{ term.partOfSpeech }}</span>
        <span v-if="term.termType" class="term-type">{{ term.termType }}</span>
      </div>
      <div class="term-actions">
        <button class="btn btn-sm" @click="editing = true">编辑</button>
        <button class="btn btn-sm btn-danger" @click="emit('delete')">删除</button>
      </div>
    </div>

    <div v-else class="edit-form">
      <div class="edit-row">
        <label>术语文本</label>
        <input v-model="termText" class="input" />
      </div>
      <div class="edit-row">
        <label>词性</label>
        <input v-model="partOfSpeech" class="input" placeholder="noun, verb, adj..." />
      </div>
      <div class="edit-row">
        <label>术语类型</label>
        <select v-model="termType" class="input">
          <option value="fullForm">完整形式 (fullForm)</option>
          <option value="acronym">首字母缩写 (acronym)</option>
          <option value="abbreviation">缩写 (abbreviation)</option>
          <option value="variant">变体 (variant)</option>
        </select>
      </div>
      <div class="edit-row">
        <label>状态</label>
        <select v-model="status" class="input">
          <option value="preferred">首选 (preferred)</option>
          <option value="admitted">允许 (admitted)</option>
          <option value="deprecated">禁用 (deprecated)</option>
        </select>
      </div>
      <div class="edit-row">
        <label>语境示例</label>
        <input v-model="contextExample" class="input" placeholder="使用该术语的例句..." />
      </div>
      <div class="edit-row">
        <label>来源</label>
        <input v-model="source" class="input" placeholder="术语来源..." />
      </div>
      <div class="form-actions">
        <button class="btn btn-sm btn-primary" @click="save">保存</button>
        <button class="btn btn-sm" @click="editing = false">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.term-row {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 14px;
}
.term-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.term-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.term-text {
  font-weight: 600;
  font-size: 15px;
  color: #222;
}
.term-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}
.term-badge.preferred {
  background: #d4edda;
  color: #155724;
}
.term-badge.admitted {
  background: #fff3cd;
  color: #856404;
}
.term-badge.deprecated {
  background: #f8d7da;
  color: #721c24;
}
.term-pos,
.term-type {
  font-size: 12px;
  color: #777;
  background: #f0f0f0;
  padding: 1px 6px;
  border-radius: 4px;
}
.term-actions {
  display: flex;
  gap: 4px;
}
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.edit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.edit-row label {
  min-width: 80px;
  font-size: 13px;
  color: #666;
}
.edit-row .input {
  flex: 1;
}
.form-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}
</style>
