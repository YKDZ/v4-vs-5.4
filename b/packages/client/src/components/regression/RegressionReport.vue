<script setup lang="ts">
import type { RegressionReport } from '@termbase/shared';

defineProps<{
  report: RegressionReport | null;
}>();
</script>

<template>
  <div v-if="!report" class="card">Run a regression task or select a report from history.</div>
  <section v-else class="stack-md">
    <div class="card">
      <div class="card-header">
        <div>
          <h2>{{ report.reportName }}</h2>
          <p class="muted">{{ report.sourceLang }} -> {{ report.targetLang }}</p>
        </div>
        <span class="badge">Score {{ report.summary.consistencyScore }}</span>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <strong>{{ report.summary.totalTermsChecked }}</strong>
          <span>Total</span>
        </div>
        <div class="stat-card">
          <strong>{{ report.summary.exactMatches }}</strong>
          <span>Exact</span>
        </div>
        <div class="stat-card">
          <strong>{{ report.summary.fuzzyMatches }}</strong>
          <span>Fuzzy</span>
        </div>
        <div class="stat-card">
          <strong>{{ report.summary.noMatches }}</strong>
          <span>No match</span>
        </div>
        <div class="stat-card">
          <strong>{{ report.summary.missing }}</strong>
          <span>Missing</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Results</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Source term</th>
              <th>Expected term</th>
              <th>Actual term</th>
              <th>Match type</th>
              <th>Status</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in report.results" :key="result.id">
              <td>{{ result.sourceTerm }}</td>
              <td>{{ result.expectedTerm || '—' }}</td>
              <td>{{ result.actualTerm || '—' }}</td>
              <td>{{ result.matchType }}</td>
              <td>{{ result.status }}</td>
              <td>{{ result.matchScore }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
