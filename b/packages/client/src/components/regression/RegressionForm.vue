<script setup lang="ts">
import type { VerifyRegressionInput } from '@termbase/shared';
import { reactive } from 'vue';

const emit = defineEmits<{
  submit: [payload: VerifyRegressionInput];
}>();

defineProps<{
  submitting?: boolean;
}>();

const form = reactive<VerifyRegressionInput>({
  reportName: 'Documentation regression check',
  sourceText: 'The user interface shows a login button for telemetry events.',
  targetText: '用户接口显示了登陆按钮来处理遥信事件。',
  sourceLang: 'en',
  targetLang: 'zh-CN',
  matchThreshold: 0.75,
});

function onSubmit() {
  emit('submit', { ...form, matchThreshold: Number(form.matchThreshold) });
}
</script>

<template>
  <form class="card form-grid" @submit.prevent="onSubmit">
    <div class="field">
      <label>Report name</label>
      <input v-model="form.reportName" required />
    </div>

    <div class="field two-up">
      <div>
        <label>Source language</label>
        <input v-model="form.sourceLang" required />
      </div>
      <div>
        <label>Target language</label>
        <input v-model="form.targetLang" required />
      </div>
    </div>

    <div class="field">
      <label>Match threshold</label>
      <input v-model.number="form.matchThreshold" type="number" min="0.5" max="1" step="0.01" />
    </div>

    <div class="field">
      <label>Source text</label>
      <textarea v-model="form.sourceText" rows="5" required />
    </div>

    <div class="field">
      <label>Target text</label>
      <textarea v-model="form.targetText" rows="5" required />
    </div>

    <div class="actions">
      <button type="submit" :disabled="submitting">Run regression</button>
    </div>
  </form>
</template>
