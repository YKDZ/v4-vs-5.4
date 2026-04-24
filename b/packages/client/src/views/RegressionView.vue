<script setup lang="ts">
import type { VerifyRegressionInput } from '@termbase/shared';
import { onMounted } from 'vue';
import RegressionForm from '../components/regression/RegressionForm.vue';
import RegressionReport from '../components/regression/RegressionReport.vue';
import { useRegressionStore } from '../stores/regression.store';

const store = useRegressionStore();

async function submitRegression(payload: VerifyRegressionInput) {
  await store.verify(payload);
}

onMounted(() => {
  void store.loadReports();
});
</script>

<template>
  <section class="grid regression-layout">
    <div class="stack-md">
      <div class="page-header">
        <div>
          <h2>Terminology regression</h2>
          <p class="muted">Check whether target content follows your preferred terminology.</p>
        </div>
      </div>

      <p v-if="store.error" class="error-banner">{{ store.error }}</p>
      <RegressionForm :submitting="store.loading" @submit="submitRegression" />

      <div class="card stack-sm">
        <h3>History</h3>
        <button
          v-for="report in store.reports"
          :key="report.id"
          class="secondary full-width"
          @click="store.loadReport(report.id)"
        >
          {{ report.reportName }}
        </button>
        <p v-if="store.reports.length === 0" class="muted">No saved reports yet.</p>
      </div>
    </div>

    <RegressionReport :report="store.currentReport" />
  </section>
</template>
