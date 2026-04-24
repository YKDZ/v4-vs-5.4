<template>
  <form class="card" @submit.prevent="submit">
    <div class="grid-2">
      <div class="field"><label>Report name</label><input v-model="form.reportName" required /></div>
      <div class="field"><label>Match threshold (0–1)</label><input type="number" step="0.01" min="0" max="1" v-model.number="form.matchThreshold" /></div>
      <div class="field"><label>Source language</label><input v-model="form.sourceLang" required /></div>
      <div class="field"><label>Target language</label><input v-model="form.targetLang" required /></div>
    </div>
    <div class="field"><label>Source text</label><textarea v-model="form.sourceText" required /></div>
    <div class="field"><label>Target text</label><textarea v-model="form.targetText" required /></div>
    <button class="primary" type="submit">Run regression</button>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const emit = defineEmits<{ (e: 'submitted', payload: any): void }>();
const form = reactive({
  reportName: 'Ad-hoc regression',
  sourceLang: 'en',
  targetLang: 'zh-CN',
  sourceText: '',
  targetText: '',
  matchThreshold: 0.75,
  persist: true,
});
function submit() { emit('submitted', { ...form }); }
</script>
