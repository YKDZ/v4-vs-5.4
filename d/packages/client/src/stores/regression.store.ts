import type { RegressionReport, RegressionVerifyPayload } from "@termbase/shared";
import { defineStore } from "pinia";
import { ref } from "vue";

import {
  fetchRegressionReportById,
  fetchRegressionReports,
  verifyRegression,
} from "../api/regression.api";

export const useRegressionStore = defineStore("regression", () => {
  const reports = ref<RegressionReport[]>([]);
  const currentReport = ref<RegressionReport | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  async function runRegression(payload: RegressionVerifyPayload) {
    loading.value = true;
    error.value = null;
    try {
      const result = await verifyRegression(payload);
      currentReport.value = result.data;
      await loadReports();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to run regression";
    } finally {
      loading.value = false;
    }
  }

  async function loadReports() {
    loading.value = true;
    error.value = null;
    try {
      const result = await fetchRegressionReports(page.value, pageSize.value);
      reports.value = result.data;
      total.value = result.meta?.total ?? 0;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load reports";
    } finally {
      loading.value = false;
    }
  }

  async function loadReport(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const result = await fetchRegressionReportById(id);
      currentReport.value = result.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load report";
    } finally {
      loading.value = false;
    }
  }

  return {
    reports,
    currentReport,
    loading,
    error,
    page,
    pageSize,
    total,
    runRegression,
    loadReports,
    loadReport,
  };
});
