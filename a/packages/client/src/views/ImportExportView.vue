<script setup lang="ts">
import { ref } from 'vue';
import { apiClient } from '../api/client.js';

const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const loading = ref(false);

async function handleExport() {
  try {
    const response = await fetch('/api/v1/tbx/export');
    const text = await response.text();
    const blob = new Blob([text], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `termbase-export-${new Date().toISOString().slice(0, 10)}.tbx`;
    a.click();
    URL.revokeObjectURL(url);
    message.value = '导出成功！';
    messageType.value = 'success';
  } catch {
    message.value = '导出失败。';
    messageType.value = 'error';
  }
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  loading.value = true;
  message.value = '';

  try {
    const xml = await file.text();
    const res = await apiClient.upload<{ imported: number }>('/tbx/import', xml, 'application/xml');
    if (res.success && res.data) {
      message.value = `导入成功！共导入 ${res.data.imported} 个概念。`;
      messageType.value = 'success';
    } else {
      message.value = res.error?.message ?? '导入失败。';
      messageType.value = 'error';
    }
  } catch {
    message.value = '导入失败，请检查文件格式。';
    messageType.value = 'error';
  }

  loading.value = false;
  input.value = '';
}
</script>

<template>
  <div class="page">
    <h2>TBX 导入 / 导出</h2>

    <div class="card">
      <h3>导出术语库</h3>
      <p class="desc">将当前术语库中的所有概念和术语条目导出为 TBX (TermBase eXchange) XML 格式。</p>
      <button class="btn btn-primary" @click="handleExport">导出 TBX 文件</button>
    </div>

    <div class="card">
      <h3>导入 TBX 文件</h3>
      <p class="desc">从 TBX XML 文件导入概念和术语条目。导入的内容将添加到现有术语库中。</p>
      <input
        type="file"
        accept=".tbx,.xml,.txt"
        @change="handleImport"
        :disabled="loading"
      />
      <p v-if="loading" class="loading-text">导入中...</p>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
}
.page h2 {
  margin: 0 0 20px;
}
.card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}
.card h3 {
  margin: 0 0 8px;
}
.desc {
  color: #777;
  font-size: 13px;
  margin: 0 0 12px;
  line-height: 1.5;
}
.loading-text {
  color: #888;
  font-size: 13px;
  margin-top: 8px;
}
.message {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
}
.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
