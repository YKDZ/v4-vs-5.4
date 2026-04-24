import type { RegressionResultItem, VerifyRegressionInput } from "@termbase/shared";
import { describe, expect, it } from "vitest";

import { AppError } from "../types/app-error";
import { RegressionService } from "./regression.service";

class FakeTermRepository {
  constructor(
    private readonly pairs: Array<{
      conceptId: number;
      sourceTerm: string;
      expectedTerm: string | null;
      deprecatedTerms: string[];
    }>,
  ) {}

  async getSourceTargetTermPairs() {
    return this.pairs;
  }
}

class FakeRegressionRepository {
  async createReport(payload: {
    reportName: string;
    sourceText: string;
    targetText: string;
    sourceLang: string;
    targetLang: string;
    matchThreshold: number;
    results: RegressionResultItem[];
  }) {
    return {
      id: 1,
      reportName: payload.reportName,
      sourceText: payload.sourceText,
      targetText: payload.targetText,
      sourceLang: payload.sourceLang,
      targetLang: payload.targetLang,
      matchThreshold: payload.matchThreshold,
      createdAt: new Date().toISOString(),
      results: payload.results,
    };
  }

  async listReports() {
    return { items: [], total: 0 };
  }

  async getReportById() {
    return null;
  }
}

const basePayload: VerifyRegressionInput = {
  reportName: "sample",
  sourceText: "The user interface should remain clear.",
  targetText: "用户界面应该保持清晰。",
  sourceLang: "en",
  targetLang: "zh-CN",
  matchThreshold: 0.75,
};

describe("regression service", () => {
  it("returns exact match result", async () => {
    const service = new RegressionService(
      new FakeTermRepository([
        {
          conceptId: 1,
          sourceTerm: "user interface",
          expectedTerm: "用户界面",
          deprecatedTerms: ["用户接口"],
        },
      ]),
      new FakeRegressionRepository(),
    );

    const result = await service.verify(basePayload);
    expect(result.results[0]?.matchType).toBe("exact");
    expect(result.summary.exactMatches).toBe(1);
  });

  it("flags deprecated term usage", async () => {
    const service = new RegressionService(
      new FakeTermRepository([
        {
          conceptId: 1,
          sourceTerm: "user interface",
          expectedTerm: "用户界面",
          deprecatedTerms: ["用户接口"],
        },
      ]),
      new FakeRegressionRepository(),
    );

    const result = await service.verify({
      ...basePayload,
      targetText: "请保持用户接口一致。",
    });
    expect(result.results[0]?.matchType).toBe("no_match");
    expect(result.results[0]?.status).toBe("warning");
  });

  it("throws when no source terms configured", async () => {
    const service = new RegressionService(
      new FakeTermRepository([]),
      new FakeRegressionRepository(),
    );
    await expect(service.verify(basePayload)).rejects.toBeInstanceOf(AppError);
  });
});
