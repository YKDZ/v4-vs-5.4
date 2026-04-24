<template>
  <div>
    <h2>TBX Import / Export</h2>

    <div class="card">
      <h3 style="margin-top: 0">Export</h3>
      <p class="muted">Download the entire termbase as TBX XML.</p>
      <button class="primary" @click="download">Download termbase.tbx</button>
    </div>

    <div class="card">
      <h3 style="margin-top: 0">Import</h3>
      <p class="muted">Upload a TBX file. This appends new concepts (it does not clear existing data).</p>
      <input type="file" accept=".tbx,.xml,text/xml,application/xml" @change="onFile" />
      <textarea v-model="raw" placeholder="…or paste TBX XML here" style="margin-top: 8px" />
      <div style="margin-top: 8px">
        <button class="primary" :disabled="!raw" @click="doImport">Import</button>
      </div>
      <div v-if="result" class="muted" style="margin-top: 8px">
        Imported {{ result.importedConcepts }} concepts / {{ result.importedTerms }} terms.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/api/client';

const raw = ref('');
const result = ref<{ importedConcepts: number; importedTerms: number } | null>(null);

async function download() {
  const xml = await api.rawText('/tbx/export');
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'termbase.tbx';
  a.click();
  URL.revokeObjectURL(url);
}

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  raw.value = await file.text();
}

async function doImport() {
  const res = await api.postXml('/tbx/import', raw.value);
  result.value = res.data as { importedConcepts: number; importedTerms: number };
}
</script>
