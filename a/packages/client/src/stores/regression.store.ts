import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RegressionReport } from '@termbase/shared';
import type { RegressionVerifyInput } from '@termbase/shared';
import { regressionApi } from '../api/regression.api.js';

export const useRegressionStore = defineStore('regression', () => {
  const reports = ref<RegressionReport[]>([]);
  const currentReport = ref<RegressionReport | null>(null);
  const loading = ref(false);

  async function verify(data: RegressionVerifyInput) {
    loading.value = true;
    const res = await regressionApi.verify(data);
    if (res.success && res.data) {
      currentReport.value = res.data;
    }
    loading.value = false;
    return res;
  }

  async function fetchReports(page: number = 1) {
    loading.value = true;
    const res = await regressionApi.listReports(page);
    if (res.success && res.data) {
      reports.value = res.data;
    }
    loading.value = false;
  }

  async function fetchReport(id: number) {
    loading.value = true;
    const res = await regressionApi.getReport(id);
    if (res.success && res.data) {
      currentReport.value = res.data;
    }
    loading.value = false;
  }

  return {
    reports,
    currentReport,
    loading,
    verify,
    fetchReports,
    fetchReport,
  };
});
