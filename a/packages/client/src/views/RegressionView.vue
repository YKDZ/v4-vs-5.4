<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRegressionStore } from '../stores/regression.store.js';
import RegressionForm from '../components/regression/RegressionForm.vue';
import RegressionReport from '../components/regression/RegressionReport.vue';

const store = useRegressionStore();
const showHistory = ref(false);

onMounted(() => {
  store.fetchReports();
});

async function onVerify(data: {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  reportName?: string;
  matchThreshold: number;
}) {
  await store.verify(data);
  showHistory.value = false;
}

async function onViewReport(id: number) {
  await store.fetchReport(id);
  showHistory.value = false;
}
</script>

<template>
  <div class="page">
    <h2>术语回归验证</h2>

    <RegressionForm @verify="onVerify" />

    <div v-if="store.loading" class="loading">执行中...</div>

    <div v-else-if="store.currentReport && !showHistory">
      <RegressionReport :report="store.currentReport" />
      <button class="btn btn-back" style="margin-top: 16px" @click="store.currentReport = null">
        新的验证
      </button>
    </div>

    <div class="history-section">
      <h3 @click="showHistory = !showHistory" class="history-toggle">
        {{ showHistory ? '▼' : '▶' }} 历史报告 ({{ store.reports.length }})
      </h3>
      <div v-if="showHistory && store.reports.length" class="history-list">
        <div
          v-for="report in store.reports"
          :key="report.id"
          class="history-item"
          @click="onViewReport(report.id)"
        >
          <span>{{ report.reportName || `报告 #${report.id}` }}</span>
          <span class="history-meta">
            {{ report.sourceLang }} → {{ report.targetLang }}
            | {{ new Date(report.createdAt).toLocaleDateString('zh-CN') }}
          </span>
        </div>
      </div>
      <p v-else-if="showHistory" class="empty-text">暂无历史报告</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
.page h2 {
  margin: 0 0 20px;
}
.loading {
  text-align: center;
  padding: 24px;
  color: #999;
}
.history-section {
  margin-top: 24px;
}
.history-toggle {
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  color: #555;
}
.history-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.history-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.history-item:hover {
  background: #eef;
}
.history-meta {
  color: #888;
  font-size: 13px;
}
.empty-text {
  color: #aaa;
  font-size: 13px;
  padding: 12px 0;
}
</style>
