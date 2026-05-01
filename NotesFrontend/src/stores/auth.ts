import { defineStore } from 'pinia';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USERNAME_KEY = 'auth_username';
const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5126';

const emptyErrors = () => ({} as Record<string, string>);

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: (localStorage.getItem(AUTH_TOKEN_KEY) as string | null) ?? null,
    userName: (localStorage.getItem(AUTH_USERNAME_KEY) as string | null) ?? null,
    loginName: '',
    loginPassword: '',
    loginLoading: false,
    loginErrors: emptyErrors(),
    registerName: '',
    registerPassword: '',
    registerConfirmPassword: '',
    registerLoading: false,
    registerErrors: emptyErrors(),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    clearLoginForm() {
      this.loginName = '';
      this.loginPassword = '';
      this.loginLoading = false;
      this.loginErrors = emptyErrors();
    },
    clearRegisterForm() {
      this.registerName = '';
      this.registerPassword = '';
      this.registerConfirmPassword = '';
      this.registerLoading = false;
      this.registerErrors = emptyErrors();
    },
    setToken(token: string | null, name?: string) {
      this.token = token;
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        if (name) {
          this.userName = name;
          localStorage.setItem(AUTH_USERNAME_KEY, name);
        }
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USERNAME_KEY);
        this.userName = null;
      }
    },
    async login() {
      this.loginErrors = emptyErrors();

      if (!this.loginName) {
        this.loginErrors.name = 'Name is required.';
      }

      if (!this.loginPassword) {
        this.loginErrors.password = 'Password is required.';
      } else if (this.loginPassword.length < 6) {
        this.loginErrors.password = 'Password must be at least 6 characters.';
      }

      if (Object.keys(this.loginErrors).length > 0) {
        return false;
      }

      this.loginLoading = true;

      try {
        const payload: LoginRequest = {
          name: this.loginName,
          password: this.loginPassword,
        };

        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          this.loginErrors.submit = 'Login failed.';
          return false;
        }

        const responseText = await response.text();
        const data = (responseText ? JSON.parse(responseText) : null) as AuthResponse | null;

        if (data?.token) {
          this.setToken(data.token, data.name);
          this.clearLoginForm();
          return true;
        }

        this.loginErrors.submit = 'Login failed.';
        return false;
      } catch {
        this.loginErrors.submit = 'An error occurred. Please try again.';
        return false;
      } finally {
        this.loginLoading = false;
      }
    },
    async register() {
      this.registerErrors = emptyErrors();

      if (!this.registerName) {
        this.registerErrors.username = 'Username is required.';
      } else if (this.registerName.length < 3) {
        this.registerErrors.username = 'Username must be at least 3 characters.';
      }

      if (!this.registerPassword) {
        this.registerErrors.password = 'Password is required.';
      } else if (this.registerPassword.length < 6) {
        this.registerErrors.password = 'Password must be at least 6 characters.';
      }

      if (this.registerPassword !== this.registerConfirmPassword) {
        this.registerErrors.confirmPassword = 'Passwords do not match.';
      }

      if (Object.keys(this.registerErrors).length > 0) {
        return false;
      }

      this.registerLoading = true;

      try {
        const payload: RegisterRequest = {
          name: this.registerName,
          password: this.registerPassword,
        };

        const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          this.registerErrors.submit = 'Registration failed.';
          return false;
        }

        this.clearRegisterForm();
        return true;
      } catch {
        this.registerErrors.submit = 'An error occurred. Please try again.';
        return false;
      } finally {
        this.registerLoading = false;
      }
    },
    logout() {
      this.clearLoginForm();
      this.clearRegisterForm();
      this.setToken(null);
    },
  },
});
