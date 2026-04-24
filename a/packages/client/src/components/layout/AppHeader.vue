<script setup lang="ts">
</script>

<template>
  <header class="app-header">
    <h1 class="logo">
      <router-link to="/">术语库管理系统</router-link>
    </h1>
    <nav class="nav">
      <router-link to="/concepts" class="nav-link">概念管理</router-link>
      <router-link to="/regression" class="nav-link">术语回归</router-link>
      <router-link to="/import-export" class="nav-link">导入导出</router-link>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 56px;
  background: #1a1a2e;
  color: #fff;
  gap: 32px;
}
.logo {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
.logo a {
  color: #e0e0ff;
  text-decoration: none;
}
.nav {
  display: flex;
  gap: 8px;
}
.nav-link {
  color: #aabbcc;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
}
.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
