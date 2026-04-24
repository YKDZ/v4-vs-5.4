<script setup lang="ts">
import type { RegressionReport } from '@termbase/shared';

const props = defineProps<{
  report: RegressionReport;
}>();

function statusClass(status: string) {
  return {
    pass: 'status-pass',
    warning: 'status-warn',
    error: 'status-err',
  }[status] ?? '';
}

function statusLabel(status: string) {
  return {
    pass: '通过',
    warning: '警告',
    error: '错误',
  }[status] ?? status;
}

function matchTypeLabel(type: string) {
  return {
    exact: '精确匹配',
    fuzzy: '模糊匹配',
    no_match: '不匹配',
    missing: '缺失',
  }[type] ?? type;
}
</script>

<template>
  <div class="report">
    <div class="report-header">
      <h3>{{ report.reportName || '术语回归报告' }}</h3>
      <span class="report-id">#{{ report.id }}</span>
    </div>

    <div class="report-meta">
      <span>源语言: {{ report.sourceLang }}</span>
      <span>目标语言: {{ report.targetLang }}</span>
      <span>阈值: {{ report.matchThreshold }}</span>
      <span>创建: {{ new Date(report.createdAt).toLocaleString('zh-CN') }}</span>
    </div>

    <!-- Summary -->
    <div v-if="report.summary" class="summary">
      <h4>验证摘要</h4>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-value">{{ report.summary.totalTermsChecked }}</span>
          <span class="summary-label">检测术语</span>
        </div>
        <div class="summary-item pass">
          <span class="summary-value">{{ report.summary.exactMatches }}</span>
          <span class="summary-label">精确匹配</span>
        </div>
        <div class="summary-item warn">
          <span class="summary-value">{{ report.summary.fuzzyMatches }}</span>
          <span class="summary-label">模糊匹配</span>
        </div>
        <div class="summary-item warn">
          <span class="summary-value">{{ report.summary.noMatches }}</span>
          <span class="summary-label">不匹配</span>
        </div>
        <div class="summary-item err">
          <span class="summary-value">{{ report.summary.missing }}</span>
          <span class="summary-label">缺失</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ (report.summary.consistencyScore * 100).toFixed(1) }}%</span>
          <span class="summary-label">一致性得分</span>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="report.results?.length" class="results">
      <h4>验证结果明细</h4>
      <table class="results-table">
        <thead>
          <tr>
            <th>源术语</th>
            <th>期望术语</th>
            <th>实际术语</th>
            <th>匹配类型</th>
            <th>匹配分数</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in report.results" :key="r.id" :class="statusClass(r.status)">
            <td>{{ r.sourceTerm }}</td>
            <td>{{ r.expectedTerm || '-' }}</td>
            <td>{{ r.actualTerm || '-' }}</td>
            <td>{{ matchTypeLabel(r.matchType) }}</td>
            <td>{{ (r.matchScore * 100).toFixed(0) }}%</td>
            <td>
              <span class="badge" :class="statusClass(r.status)">
                {{ statusLabel(r.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Source/Target text preview -->
    <details class="text-preview">
      <summary>查看源/目标文本</summary>
      <div class="text-columns">
        <div>
          <strong>源文本:</strong>
          <p>{{ report.sourceText }}</p>
        </div>
        <div>
          <strong>目标文本:</strong>
          <p>{{ report.targetText }}</p>
        </div>
      </div>
    </details>
  </div>
</template>

<style scoped>
.report {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
}
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.report-header h3 {
  margin: 0;
}
.report-id {
  color: #aaa;
  font-size: 13px;
}
.report-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #888;
  margin: 12px 0;
  flex-wrap: wrap;
}
.summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}
.summary h4 {
  margin: 0 0 12px;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}
.summary-item {
  text-align: center;
  padding: 10px;
  border-radius: 6px;
  background: #fff;
}
.summary-item.pass { border-left: 3px solid #28a745; }
.summary-item.warn { border-left: 3px solid #ffc107; }
.summary-item.err { border-left: 3px solid #dc3545; }
.summary-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #333;
}
.summary-label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
.results {
  margin: 16px 0;
}
.results h4 {
  margin: 0 0 8px;
}
.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.results-table th,
.results-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.results-table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #555;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
.status-pass { background: #d4edda; color: #155724; }
.status-warn { background: #fff3cd; color: #856404; }
.status-err { background: #f8d7da; color: #721c24; }

.text-preview {
  margin-top: 16px;
}
.text-preview summary {
  cursor: pointer;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}
.text-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.text-columns p {
  font-size: 13px;
  color: #555;
  white-space: pre-wrap;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
}
</style>
