<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const emit = defineEmits<{
  (event: "register-success"): void;
  (event: "switch-to-login"): void;
}>();

const authStore = useAuthStore();

const handleRegister = async () => {
  const success = await authStore.register();
  if (success) {
    emit('register-success');
  }
};
</script>

<template>
  <div class="relative z-10 w-full max-w-[420px]">
    <div class="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-soft flex flex-col gap-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-[#e36244] to-[#f6b26b] text-white font-display font-bold text-2xl grid place-items-center shadow-soft flex-shrink-0">N</div>
        <div>
          <h1 class="text-2xl font-display font-semibold m-0">Create account</h1>
          <p class="mt-1.5 text-[var(--muted)] text-sm">Join to start capturing your ideas</p>
        </div>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="handleRegister">
        <div class="flex flex-col gap-2">
          <label for="username" class="text-xs text-[var(--muted)]">Username</label>
          <input
            id="username"
            v-model="authStore.registerName"
            :class="['input-base', { 'input-error': authStore.registerErrors.username }]"
            type="text"
            placeholder="your_username"
          />
          <p v-if="authStore.registerErrors.username" class="error-text">{{ authStore.registerErrors.username }}</p>
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-xs text-[var(--muted)]">Password</label>
          <input
            id="password"
            v-model="authStore.registerPassword"
            :class="['input-base', { 'input-error': authStore.registerErrors.password }]"
            type="password"
            placeholder="••••••••"
          />
          <p v-if="authStore.registerErrors.password" class="error-text">{{ authStore.registerErrors.password }}</p>
        </div>

        <div class="flex flex-col gap-2">
          <label for="confirm-password" class="text-xs text-[var(--muted)]">Confirm password</label>
          <input
            id="confirm-password"
            v-model="authStore.registerConfirmPassword"
            :class="['input-base', { 'input-error': authStore.registerErrors.confirmPassword }]"
            type="password"
            placeholder="••••••••"
          />
          <p v-if="authStore.registerErrors.confirmPassword" class="error-text">
            {{ authStore.registerErrors.confirmPassword }}
          </p>
        </div>

        <p v-if="authStore.registerErrors.submit" class="error-text">{{ authStore.registerErrors.submit }}</p>

        <button class="btn-primary w-full text-base" type="submit" :disabled="authStore.registerLoading">
          {{ authStore.registerLoading ? "Creating account..." : "Create account" }}
        </button>
      </form>

      <div class="text-center">
        <p class="m-0 text-sm text-[var(--muted)]">
          Already have an account?
          <button class="bg-none border-none text-[var(--accent)] font-semibold cursor-pointer p-0 mx-1 hover:underline" type="button" @click="emit('switch-to-login')">
            Sign in
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
