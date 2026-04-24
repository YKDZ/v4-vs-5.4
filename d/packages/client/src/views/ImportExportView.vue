<script setup lang="ts">
import { ref } from "vue";

import { exportTbx, importTbx } from "../api/tbx.api";

const tbxContent = ref("");
const output = ref("");
const loading = ref(false);
const error = ref<string | null>(null);

async function handleImport() {
  loading.value = true;
  error.value = null;
  output.value = "";
  try {
    const result = await importTbx(tbxContent.value);
    output.value = `导入完成：概念 ${result.data.conceptsImported}，术语 ${result.data.termsImported}`;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "导入失败";
  } finally {
    loading.value = false;
  }
}

async function handleExport() {
  loading.value = true;
  error.value = null;
  output.value = "";
  try {
    const xml = await exportTbx();
    output.value = xml;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "导出失败";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="page">
    <h2>TBX 导入导出</h2>
    <section class="card">
      <h3>导入 TBX</h3>
      <textarea v-model="tbxContent" rows="12" placeholder="粘贴 TBX XML 内容" />
      <button class="mt-8" :disabled="loading || !tbxContent.trim()" @click="handleImport">
        导入
      </button>
    </section>

    <section class="card">
      <h3>导出 TBX</h3>
      <button :disabled="loading" @click="handleExport">导出并预览 XML</button>
    </section>

    <p v-if="error" class="error-text">{{ error }}</p>
    <section v-if="output" class="card">
      <h3>输出</h3>
      <pre class="output-pre">{{ output }}</pre>
    </section>
  </section>
</template>
