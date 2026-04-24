<script setup lang="ts">
import { ref } from 'vue';
import type { ConceptWithLanguages } from '@termbase/shared';

const props = defineProps<{
  concept: ConceptWithLanguages;
}>();

const emit = defineEmits<{
  update: [data: { definition?: string | null; subjectField?: string | null; note?: string | null }];
}>();

const editing = ref(false);
const definition = ref(props.concept.definition ?? '');
const subjectField = ref(props.concept.subjectField ?? '');
const note = ref(props.concept.note ?? '');

function startEdit() {
  definition.value = props.concept.definition ?? '';
  subjectField.value = props.concept.subjectField ?? '';
  note.value = props.concept.note ?? '';
  editing.value = true;
}

function save() {
  emit('update', {
    definition: definition.value || null,
    subjectField: subjectField.value || null,
    note: note.value || null,
  });
  editing.value = false;
}

function cancel() {
  editing.value = false;
}
</script>

<template>
  <div class="concept-info">
    <div class="info-header">
      <h2>概念详情</h2>
      <button v-if="!editing" class="btn btn-sm" @click="startEdit">编辑</button>
    </div>

    <div v-if="editing" class="edit-form">
      <label>学科领域</label>
      <input v-model="subjectField" class="input" placeholder="如: computer science" />

      <label>定义</label>
      <textarea v-model="definition" class="input textarea" rows="3" placeholder="概念定义..."></textarea>

      <label>备注</label>
      <textarea v-model="note" class="input textarea" rows="2" placeholder="备注..."></textarea>

      <div class="form-actions">
        <button class="btn btn-primary" @click="save">保存</button>
        <button class="btn" @click="cancel">取消</button>
      </div>
    </div>

    <div v-else class="info-view">
      <div class="info-row">
        <span class="label">UUID:</span>
        <span class="value mono">{{ concept.uuid }}</span>
      </div>
      <div class="info-row">
        <span class="label">学科领域:</span>
        <span class="value">{{ concept.subjectField || '-' }}</span>
      </div>
      <div class="info-row">
        <span class="label">定义:</span>
        <span class="value">{{ concept.definition || '-' }}</span>
      </div>
      <div class="info-row">
        <span class="label">备注:</span>
        <span class="value">{{ concept.note || '-' }}</span>
      </div>
      <div class="info-row">
        <span class="label">创建时间:</span>
        <span class="value">{{ new Date(concept.createdAt).toLocaleString('zh-CN') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.concept-info {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.info-header h2 {
  margin: 0;
  font-size: 18px;
}
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.edit-form label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}
.info-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-row {
  display: flex;
  gap: 12px;
}
.label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
  font-size: 13px;
}
.value {
  color: #333;
  font-size: 14px;
}
.mono {
  font-family: monospace;
  font-size: 12px;
  color: #888;
}
.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
</style>
