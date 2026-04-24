<template>
  <div class="card">
    <h3 style="margin-top: 0">{{ report.reportName }}</h3>
    <div class="row">
      <div><strong>{{ report.summary.totalTermsChecked }}</strong><div class="muted">checked</div></div>
      <div class="status-pass"><strong>{{ report.summary.exactMatches }}</strong><div class="muted">exact</div></div>
      <div class="status-warning"><strong>{{ report.summary.fuzzyMatches }}</strong><div class="muted">fuzzy</div></div>
      <div class="status-error"><strong>{{ report.summary.noMatches }}</strong><div class="muted">no match</div></div>
      <div class="status-error"><strong>{{ report.summary.missing }}</strong><div class="muted">missing</div></div>
      <div><strong>{{ (report.summary.consistencyScore * 100).toFixed(1) }}%</strong><div class="muted">consistency</div></div>
    </div>
  </div>

  <div class="card">
    <table>
      <thead>
        <tr>
          <th>Source term</th>
          <th>Expected</th>
          <th>Actual</th>
          <th>Match</th>
          <th>Score</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in report.results" :key="i" :class="'status-' + r.status">
          <td>{{ r.sourceTerm }}</td>
          <td>{{ r.expectedTerm ?? '—' }}</td>
          <td>{{ r.actualTerm ?? '—' }}</td>
          <td>{{ r.matchType }}</td>
          <td>{{ r.matchScore.toFixed(3) }}</td>
          <td>{{ r.status }}</td>
        </tr>
        <tr v-if="report.results.length === 0"><td colspan="6" class="muted">No findings.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { RegressionReport } from '@termbase/shared';
defineProps<{ report: RegressionReport }>();
</script>
