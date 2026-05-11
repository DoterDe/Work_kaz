import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppErrorBoundary } from "./components/AppErrorBoundary";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing");

const appTree = (
  <AuthProvider>
    <App />
  </AuthProvider>
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
