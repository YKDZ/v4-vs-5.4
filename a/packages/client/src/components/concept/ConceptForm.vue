<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  create: [data: { definition?: string; subjectField?: string; note?: string }];
}>();

const definition = ref('');
const subjectField = ref('');
const note = ref('');
const show = ref(false);

function submit() {
  emit('create', {
    definition: definition.value || undefined,
    subjectField: subjectField.value || undefined,
    note: note.value || undefined,
  });
  definition.value = '';
  subjectField.value = '';
  note.value = '';
  show.value = false;
}
</script>

<template>
  <div class="concept-form">
    <button v-if="!show" class="btn btn-primary" @click="show = true">+ 新建概念</button>

    <form v-else class="form" @submit.prevent="submit">
      <h3>新建概念</h3>
      <input v-model="subjectField" class="input" placeholder="学科领域 (如: computer science)" />
      <textarea v-model="definition" class="input textarea" rows="3" placeholder="概念定义..."></textarea>
      <textarea v-model="note" class="input textarea" rows="2" placeholder="备注..."></textarea>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">创建</button>
        <button type="button" class="btn" @click="show = false">取消</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.concept-form {
  margin-bottom: 20px;
}
.form {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form h3 {
  margin: 0 0 4px;
}
.form-actions {
  display: flex;
  gap: 8px;
}
</style>
