<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <header class="relative z-10 flex items-center justify-between gap-6">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e36244] to-[#f6b26b] text-white font-display font-bold text-lg grid place-items-center shadow-soft">N</div>
      <div>
        <p class="text-lg font-display font-semibold m-0">Notes Application</p>
        <p class="m-1 text-[var(--muted)] text-sm">{{ authStore.userName || '' }}</p>
      </div>
    </div>
    <button class="btn-primary text-sm" type="button" @click="authStore.logout()">Logout</button>
  </header>
</template>
