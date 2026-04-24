<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  verify: [data: {
    sourceText: string;
    targetText: string;
    sourceLang: string;
    targetLang: string;
    reportName?: string;
    matchThreshold: number;
  }];
}>();

const sourceText = ref('');
const targetText = ref('');
const sourceLang = ref('en');
const targetLang = ref('zh-CN');
const reportName = ref('');
const matchThreshold = ref(0.75);

function submit() {
  if (!sourceText.value.trim() || !targetText.value.trim()) return;
  emit('verify', {
    sourceText: sourceText.value.trim(),
    targetText: targetText.value.trim(),
    sourceLang: sourceLang.value,
    targetLang: targetLang.value,
    reportName: reportName.value || undefined,
    matchThreshold: matchThreshold.value,
  });
}
</script>

<template>
  <form class="regression-form" @submit.prevent="submit">
    <h3>术语回归验证</h3>
    <p class="form-desc">输入源文本和目标译文，系统将检查术语使用的一致性。</p>

    <div class="form-grid">
      <div class="field">
        <label>源语言</label>
        <select v-model="sourceLang" class="input">
          <option value="en">English</option>
          <option value="zh-CN">中文 (简体)</option>
          <option value="ja">日本語</option>
        </select>
      </div>
      <div class="field">
        <label>目标语言</label>
        <select v-model="targetLang" class="input">
          <option value="zh-CN">中文 (简体)</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </div>
      <div class="field">
        <label>匹配阈值</label>
        <input v-model.number="matchThreshold" type="number" min="0" max="1" step="0.05" class="input" />
      </div>
      <div class="field">
        <label>报告名称</label>
        <input v-model="reportName" class="input" placeholder="可选..." />
      </div>
    </div>

    <div class="field">
      <label>源文本</label>
      <textarea v-model="sourceText" class="input textarea" rows="4"
        placeholder="输入源语言文本。例如: The user interface provides a framework for machine learning algorithms."></textarea>
    </div>

    <div class="field">
      <label>目标译文</label>
      <textarea v-model="targetText" class="input textarea" rows="4"
        placeholder="输入目标语言译文。例如: 用户界面为机器学习算法提供了一个框架。"></textarea>
    </div>

    <button type="submit" class="btn btn-primary" :disabled="!sourceText.trim() || !targetText.trim()">
      执行回归验证
    </button>
  </form>
</template>

<style scoped>
.regression-form {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}
.regression-form h3 {
  margin: 0 0 4px;
}
.form-desc {
  color: #777;
  font-size: 13px;
  margin: 0 0 16px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.field label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}
</style>
