<script setup lang="ts">
import type { RegressionVerifyPayload } from "@termbase/shared";
import { reactive } from "vue";

const emit = defineEmits<{
  submit: [payload: RegressionVerifyPayload];
}>();

const form = reactive<RegressionVerifyPayload>({
  reportName: "",
  sourceText: "",
  targetText: "",
  sourceLang: "en",
  targetLang: "zh-CN",
  matchThreshold: 0.75,
});

function submit() {
  emit("submit", {
    ...form,
    reportName: form.reportName.trim(),
    sourceText: form.sourceText.trim(),
    targetText: form.targetText.trim(),
  });
}
</script>

<template>
  <form class="card" @submit.prevent="submit">
    <h2>创建回归任务</h2>
    <label class="field">
      <span>报告名称</span>
      <input v-model="form.reportName" required />
    </label>
    <div class="row gap-8">
      <label class="field flex-1">
        <span>源语言</span>
        <input v-model="form.sourceLang" required />
      </label>
      <label class="field flex-1">
        <span>目标语言</span>
        <input v-model="form.targetLang" required />
      </label>
      <label class="field flex-1">
        <span>匹配阈值</span>
        <input v-model.number="form.matchThreshold" type="number" min="0" max="1" step="0.01" />
      </label>
    </div>
    <label class="field">
      <span>源文本</span>
      <textarea v-model="form.sourceText" rows="5" required />
    </label>
    <label class="field">
      <span>目标文本</span>
      <textarea v-model="form.targetText" rows="5" required />
    </label>
    <button type="submit">执行回归</button>
  </form>
</template>
