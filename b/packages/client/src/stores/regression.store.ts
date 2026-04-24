import type { RegressionReport, VerifyRegressionInput } from '@termbase/shared';
import { defineStore } from 'pinia';
import { getRegressionReport, listRegressionReports, verifyRegression } from '../api/regression.api';

export const useRegressionStore = defineStore('regression', {
  state: () => ({
    reports: [] as RegressionReport[],
    currentReport: null as RegressionReport | null,
    loading: false,
    error: '' as string | null,
  }),
  actions: {
    async loadReports() {
      this.loading = true;
      this.error = null;

      try {
        const response = await listRegressionReports();
        this.reports = response.data ?? [];
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load reports';
      } finally {
        this.loading = false;
      }
    },
    async loadReport(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await getRegressionReport(id);
        this.currentReport = response.data ?? null;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load report';
      } finally {
        this.loading = false;
      }
    },
    async verify(payload: VerifyRegressionInput) {
      this.loading = true;
      this.error = null;

      try {
        const response = await verifyRegression(payload);
        this.currentReport = response.data ?? null;
        await this.loadReports();
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to run regression';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
