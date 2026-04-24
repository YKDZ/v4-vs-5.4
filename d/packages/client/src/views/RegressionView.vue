<script setup lang="ts">
import type { RegressionVerifyPayload } from "@termbase/shared";
import { onMounted } from "vue";

import RegressionForm from "../components/regression/RegressionForm.vue";
import RegressionReport from "../components/regression/RegressionReport.vue";
import { useRegressionStore } from "../stores/regression.store";

const regressionStore = useRegressionStore();

onMounted(async () => {
  await regressionStore.loadReports();
});

async function handleSubmit(payload: RegressionVerifyPayload) {
  await regressionStore.runRegression(payload);
}
</script>

<template>
  <section class="page">
    <h2>术语回归验证</h2>
    <RegressionForm @submit="handleSubmit" />
    <p v-if="regressionStore.loading">处理中...</p>
    <p v-if="regressionStore.error" class="error-text">{{ regressionStore.error }}</p>
    <RegressionReport :report="regressionStore.currentReport" />

    <section class="card">
      <h3>历史报告</h3>
      <ul class="report-list">
        <li v-for="item in regressionStore.reports" :key="item.id" class="row justify-between">
          <span>{{ item.reportName }}</span>
          <button @click="regressionStore.loadReport(item.id)">查看</button>
        </li>
      </ul>
      <p v-if="regressionStore.reports.length === 0" class="muted">暂无历史报告</p>
    </section>
  </section>
</template>
