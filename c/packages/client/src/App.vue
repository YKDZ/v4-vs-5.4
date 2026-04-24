<template>
  <div>
    <AppHeader />
    <main class="container">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue';
</script>
