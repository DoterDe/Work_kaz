import api from "./axios";

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  login: string; 
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<TokenPair>("token/", payload);
    return response.data;
  },

  async register(payload: RegisterPayload) {
    const response = await api.post("register/", payload);
    return response.data;
  },

  async googleLogin(idToken: string) {
    const response = await api.post<TokenPair>("auth/google-login/", {
      id_token: idToken,
    });
    return response.data;
  },
};
