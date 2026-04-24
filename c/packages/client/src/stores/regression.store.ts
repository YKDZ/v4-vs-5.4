import { defineStore } from 'pinia';
import { ref } from 'vue';
import { regressionApi } from '@/api/regression.api';
import type { RegressionReport, RegressionVerifyInput } from '@termbase/shared';

export const useRegressionStore = defineStore('regression', () => {
  const report = ref<RegressionReport | null>(null);
  const history = ref<Array<{ id: number; reportName: string; createdAt: string }>>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function runVerify(input: RegressionVerifyInput) {
    loading.value = true;
    error.value = null;
    try {
      const res = await regressionApi.verify(input);
      report.value = res.data ?? null;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function loadHistory() {
    const res = await regressionApi.listReports();
    history.value = res.data ?? [];
  }

  return { report, history, loading, error, runVerify, loadHistory };
});
