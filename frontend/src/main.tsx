import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { AppPreferencesProvider } from "./context/AppPreferencesContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing");

const appTree = (
  <AppPreferencesProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </AppPreferencesProvider>
);

createRoot(container).render(
  <AppErrorBoundary>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider>
    ) : (
      appTree
    )}
  </AppErrorBoundary>
);
