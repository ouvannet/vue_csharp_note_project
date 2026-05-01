<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "./stores/auth";
import TopBar from "./components/TopBar.vue";
import NotesListPanel from "./components/NotesListPanel.vue";
import LoginForm from "./components/LoginForm.vue";
import RegisterForm from "./components/RegisterForm.vue";

const authStore = useAuthStore();
const authMode = ref<"login" | "register">("login");

</script>
<template>
  <div v-if="!authStore.isAuthenticated" class="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
    <div class="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
      <span class="absolute w-64 h-64 rounded-full opacity-45 animate-float orb--one" style="background: radial-gradient(circle, rgba(227, 98, 68, 0.35), transparent 70%); top: -40px; right: 12%;"></span>
      <span class="absolute w-80 h-80 rounded-full opacity-45 animate-float orb--two" style="background: radial-gradient(circle, rgba(15, 139, 141, 0.32), transparent 70%); bottom: -80px; left: 4%;"></span>
      <span class="absolute w-56 h-56 rounded-full opacity-45 animate-float orb--three" style="background: radial-gradient(circle, rgba(248, 195, 114, 0.4), transparent 70%); top: 30%; left: 38%;"></span>
    </div>
    <LoginForm
      v-if="authMode === 'login'"
      @switch-to-register="authMode = 'register'"
    />
    <RegisterForm
      v-else
      @register-success="authMode = 'login'"
      @switch-to-login="authMode = 'login'"
    />
  </div>

  <div v-else class="relative min-h-screen px-8 py-14 flex flex-col gap-7 overflow-hidden md:px-[100px] lg:px-[200px]">
    <TopBar />
    <main class="relative z-10 grid grid-cols-1 gap-6">
      <NotesListPanel />
    </main>
  </div>
</template>
