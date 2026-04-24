<script setup lang="ts">
import { ref } from 'vue';
import { exportTbx, importTbx } from '../api/tbx.api';
import { useConceptStore } from '../stores/concept.store';

const selectedFile = ref<File | null>(null);
const statusMessage = ref('');
const loading = ref(false);
const conceptStore = useConceptStore();

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function handleExport() {
  loading.value = true;
  statusMessage.value = '';

  try {
    const xml = await exportTbx();
    downloadFile(xml, 'termbase-export.tbx.xml');
    statusMessage.value = 'TBX export downloaded successfully.';
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : 'TBX export failed.';
  } finally {
    loading.value = false;
  }
}

async function handleImport() {
  if (!selectedFile.value) {
    statusMessage.value = 'Choose a TBX file first.';
    return;
  }

  loading.value = true;
  statusMessage.value = '';

  try {
    const response = await importTbx(selectedFile.value);
    statusMessage.value = `Imported ${response.data?.importedConcepts ?? 0} concepts and ${response.data?.importedTerms ?? 0} terms.`;
    await conceptStore.loadConcepts({ page: 1, pageSize: conceptStore.meta.pageSize, search: conceptStore.search });
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : 'TBX import failed.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="stack-md">
    <div class="page-header">
      <div>
        <h2>TBX import and export</h2>
        <p class="muted">Exchange concept-oriented terminology with a practical TBX subset.</p>
      </div>
    </div>

    <div class="grid two-columns">
      <div class="card stack-sm">
        <h3>Export</h3>
        <p class="muted">Download the full termbase as TBX XML.</p>
        <button :disabled="loading" @click="handleExport">Export TBX</button>
      </div>

      <div class="card stack-sm">
        <h3>Import</h3>
        <p class="muted">Upload a TBX XML file and append its concepts.</p>
        <input type="file" accept=".xml,.tbx" @change="selectedFile = ($event.target as HTMLInputElement).files?.[0] ?? null" />
        <button :disabled="loading" @click="handleImport">Import TBX</button>
      </div>
    </div>

    <p v-if="statusMessage" class="card">{{ statusMessage }}</p>
  </section>
</template>
