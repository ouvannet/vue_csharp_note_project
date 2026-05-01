export type AuthUser = {
  id: number;
  token: string;
};

export type LoginRequest = {
  name: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  password: string;
};

export type AuthResponse = {
  id: number;
  name: string;
  token: string;
};
