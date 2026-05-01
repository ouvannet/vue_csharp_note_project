<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const emit = defineEmits<{
  (event: "login-success"): void;
  (event: "switch-to-register"): void;
}>();

const authStore = useAuthStore();

const handleLogin = async () => {
  const success = await authStore.login();
  if (success) {
    emit('login-success');
  }
};
</script>

<template>
  <div class="relative z-10 w-full max-w-[420px]">
    <div class="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-soft flex flex-col gap-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-[#e36244] to-[#f6b26b] text-white font-display font-bold text-2xl grid place-items-center shadow-soft flex-shrink-0">N</div>
        <div>
          <h1 class="text-2xl font-display font-semibold m-0">Welcome back</h1>
          <p class="mt-1.5 text-[var(--muted)] text-sm">Sign in to access your notes</p>
        </div>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
        <div class="flex flex-col gap-2">
          <label for="name" class="text-xs text-[var(--muted)]">Username</label>
          <input
            id="name"
            v-model="authStore.loginName"
            :class="['input-base', { 'input-error': authStore.loginErrors.name }]"
            type="text"
            placeholder="Your name"
          />
          <p v-if="authStore.loginErrors.name" class="error-text">{{ authStore.loginErrors.name }}</p>
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-xs text-[var(--muted)]">Password</label>
          <input
            id="password"
            v-model="authStore.loginPassword"
            :class="['input-base', { 'input-error': authStore.loginErrors.password }]"
            type="password"
            placeholder="••••••••"
          />
          <p v-if="authStore.loginErrors.password" class="error-text">{{ authStore.loginErrors.password }}</p>
        </div>

        <p v-if="authStore.loginErrors.submit" class="error-text">{{ authStore.loginErrors.submit }}</p>

        <button class="btn-primary w-full text-base" type="submit" :disabled="authStore.loginLoading">
          {{ authStore.loginLoading ? "Signing in..." : "Sign in" }}
        </button>
      </form>

      <div class="text-center">
        <p class="m-0 text-sm text-[var(--muted)]">
          Don't have an account?
          <button
            class="bg-none border-none text-[var(--accent)] font-semibold cursor-pointer p-0 mx-1 hover:underline"
            type="button"
            @click="emit('switch-to-register')"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
