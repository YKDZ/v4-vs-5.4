import type { RegressionReport, VerifyRegressionInput } from '@termbase/shared';
import { apiRequest } from './client';

export async function verifyRegression(payload: VerifyRegressionInput) {
  return apiRequest<RegressionReport>('/api/v1/regression/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listRegressionReports() {
  return apiRequest<RegressionReport[]>('/api/v1/regression/reports');
}

export async function getRegressionReport(id: number) {
  return apiRequest<RegressionReport>(`/api/v1/regression/reports/${id}`);
}
