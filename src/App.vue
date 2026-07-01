<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AppToast from '@/components/common/AppToast.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink to="/" class="app-header__link">
        <h1 class="app-header__title">Manage Projects</h1>
      </RouterLink>
    </header>
    <RouterView />
    <AppToast />
  </div>
</template>
