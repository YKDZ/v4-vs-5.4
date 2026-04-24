<template>
  <div>
    <h2>Term Regression Verification</h2>
    <RegressionForm @submitted="onSubmitted" />

    <div v-if="store.loading" class="empty">Running verification…</div>
    <div v-else-if="store.error" class="empty status-error">{{ store.error }}</div>
    <RegressionReport v-else-if="store.report" :report="store.report" />

    <h3>History</h3>
    <div v-if="store.history.length === 0" class="muted">No reports yet.</div>
    <ul v-else>
      <li v-for="h in store.history" :key="h.id">
        #{{ h.id }} — {{ h.reportName }} <span class="muted">({{ h.createdAt }})</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRegressionStore } from '@/stores/regression.store';
import RegressionForm from '@/components/regression/RegressionForm.vue';
import RegressionReport from '@/components/regression/RegressionReport.vue';

const store = useRegressionStore();

async function onSubmitted(payload: any) {
  await store.runVerify(payload);
  await store.loadHistory();
}

onMounted(() => store.loadHistory());
</script>
