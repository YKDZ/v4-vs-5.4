<script setup lang="ts">
import type { RegressionReport } from "@termbase/shared";

defineProps<{
  report: RegressionReport | null;
}>();
</script>

<template>
  <section class="card">
    <h2>回归报告</h2>
    <p v-if="!report" class="muted">暂无报告</p>
    <template v-else>
      <p><strong>{{ report.reportName }}</strong></p>
      <p class="muted">
        {{ report.sourceLang }} → {{ report.targetLang }} | 一致性评分：
        {{ report.summary.consistencyScore }}
      </p>
      <ul class="summary-list">
        <li>检查术语：{{ report.summary.totalTermsChecked }}</li>
        <li>exact：{{ report.summary.exactMatches }}</li>
        <li>fuzzy：{{ report.summary.fuzzyMatches }}</li>
        <li>no_match：{{ report.summary.noMatches }}</li>
        <li>missing：{{ report.summary.missing }}</li>
      </ul>
      <table class="table">
        <thead>
          <tr>
            <th>源术语</th>
            <th>期望术语</th>
            <th>实际术语</th>
            <th>匹配类型</th>
            <th>分数</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, idx) in report.results" :key="idx">
            <td>{{ result.sourceTerm }}</td>
            <td>{{ result.expectedTerm || "-" }}</td>
            <td>{{ result.actualTerm || "-" }}</td>
            <td>{{ result.matchType }}</td>
            <td>{{ result.matchScore }}</td>
            <td>{{ result.status }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </section>
</template>
