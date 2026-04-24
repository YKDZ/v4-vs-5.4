import type { RegressionReport, RegressionVerifyPayload } from "@termbase/shared";

import { requestJson } from "./client";

export async function verifyRegression(payload: RegressionVerifyPayload) {
  return requestJson<RegressionReport>("/regression/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchRegressionReports(page = 1, pageSize = 10) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return requestJson<RegressionReport[]>(`/regression/reports?${params.toString()}`);
}

export async function fetchRegressionReportById(id: number) {
  return requestJson<RegressionReport>(`/regression/reports/${id}`);
}
