import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

import { authService } from "../api/auth.service";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";
import { extractApiErrorMessage } from "../utils/apiError";

interface RegisterPageProps {
  onNavigate: (page: string) => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (page: string | null) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  redirectAfterLogin,
  setRedirectAfterLogin,
}) => {
  const { loginWithTokens } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigateAfterSuccess = () => {
    if (redirectAfterLogin) {
      onNavigate(redirectAfterLogin);
      setRedirectAfterLogin(null);
      return;
    }
    onNavigate("dashboard");
  };

  const handleRegister = async () => {
    setError("");
    if (!username || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await authService.register({ username, email, password });
      const tokens = await authService.login({ username, password });
      await loginWithTokens(tokens);
      navigateAfterSuccess();
    } catch (error) {
      setError(extractApiErrorMessage(error, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setError("");
    setLoading(true);
    try {
      const tokens = await authService.googleLogin(credential);
      await loginWithTokens(tokens);
      navigateAfterSuccess();
    } catch (error) {
      setError(extractApiErrorMessage(error, "Google login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute right-8 top-4 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto max-w-md rounded-[28px] border border-border bg-card p-8 shadow-lg"
      >
        <h2 className="mb-2 text-center text-3xl font-semibold">Create Account</h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Start learning Kazakh with personalized progress tracking
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Button className="mt-6 w-full" size="lg" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </Button>

        <div className="my-6 text-center text-sm text-muted-foreground">OR</div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) {
                void handleGoogleLogin(res.credential);
              }
            }}
            onError={() => setError("Google login failed. Please try again.")}
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button className="text-primary hover:text-[#1557CC]" onClick={() => onNavigate("login")}>
            Login
          </button>
        </p>
      </motion.div>
    </section>
  );
};
