import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    username: string;
    email: string;
    is_content_manager?: boolean;
    stats?: {
      completed_lessons: number;
      in_progress_lessons: number;
      average_progress: number;
    };
    recent_lessons?: Array<Record<string, unknown>>;
  } | null;
  loginWithTokens: (tokens: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (access) {
      setIsAuthenticated(true);
      api.defaults.headers.common.Authorization = `Bearer ${access}`;
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/dashboard/");
      setUser(res.data);
    } catch {
      logout();
    }
  };

  const loginWithTokens = async (tokens: any) => {
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    api.defaults.headers.common.Authorization = `Bearer ${tokens.access}`;
    setIsAuthenticated(true);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete api.defaults.headers.common.Authorization;
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loginWithTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
