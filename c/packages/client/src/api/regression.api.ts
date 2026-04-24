import { api } from './client';
import type { RegressionReport, RegressionVerifyInput } from '@termbase/shared';

export const regressionApi = {
  verify: (data: RegressionVerifyInput) => api.post<RegressionReport>('/regression/verify', data),
  listReports: () => api.get<Array<{ id: number; reportName: string; createdAt: string }>>('/regression/reports'),
  getReport: (id: number) => api.get<RegressionReport & { results: any[] }>(`/regression/reports/${id}`),
};
