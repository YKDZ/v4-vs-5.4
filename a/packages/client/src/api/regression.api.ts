import type { ApiResponse, RegressionReport } from '@termbase/shared';
import type { RegressionVerifyInput } from '@termbase/shared';
import { apiClient } from './client.js';

export const regressionApi = {
  verify(data: RegressionVerifyInput) {
    return apiClient.post<RegressionReport>('/regression/verify', data);
  },

  listReports(page: number = 1, pageSize: number = 20) {
    return apiClient.get<RegressionReport[]>(`/regression/reports?page=${page}&pageSize=${pageSize}`);
  },

  getReport(id: number) {
    return apiClient.get<RegressionReport>(`/regression/reports/${id}`);
  },
};
