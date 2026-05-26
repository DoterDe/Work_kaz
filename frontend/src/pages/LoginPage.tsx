import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Brain, Eye, EyeOff, Lock, Mail, Sparkles, Trophy, Zap } from "lucide-react";

import { authService } from "../api/auth.service";
import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Button } from "../components/ui/Button";
import { CardGlow } from "../components/ui/CardGlow";
import { Input } from "../components/ui/input";
import { extractApiErrorMessage } from "../utils/apiError";

interface LoginPageProps {
  onNavigate: (page: string) => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (page: string | null) => void;
}

const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  redirectAfterLogin,
  setRedirectAfterLogin,
}) => {
  const { loginWithTokens } = useAuth();
  const { language, theme } = useAppPreferences();
  const prefersReducedMotion = useReducedMotion();

  const copy =
    language === "ru"
      ? {
          eyebrow: "Личный кабинет",
          title: "Вернитесь к урокам без лишних шагов",
          subtitle:
            "Ваш прогресс, словарь и тесты уже ждут. Войдите и продолжайте обучение в своем темпе.",
          email: "Email",
          password: "Пароль",
          showPassword: "Показать пароль",
          hidePassword: "Скрыть пароль",
          submit: "Войти",
          submitting: "Входим...",
          fillError: "Введите email и пароль.",
          fallbackError: "Не удалось выполнить вход. Попробуйте еще раз.",
          googleError: "Не удалось выполнить вход через Google.",
          noAccount: "Нет аккаунта?",
          register: "Зарегистрироваться",
          googleUnavailable: "Google-вход появится после добавления client id",
          features: [
            { icon: Brain, text: "Прогресс синхронизируется между уроками" },
            { icon: Trophy, text: "Быстрый доступ к словарю и тестам" },
            { icon: Zap, text: "Кабинет для контент-менеджеров" },
          ],
        }
      : {
          eyebrow: "Жеке кабинет",
          title: "Сабақтарға артық қадамсыз қайта оралыңыз",
          subtitle:
            "Прогрессіңіз, сөздігіңіз және тесттеріңіз дайын. Кіріп, оқуды өз ырғағыңызбен жалғастырыңыз.",
          email: "Email",
          password: "Құпиясөз",
          showPassword: "Құпиясөзді көрсету",
          hidePassword: "Құпиясөзді жасыру",
          submit: "Кіру",
          submitting: "Кіріп жатырмыз...",
          fillError: "Email және құпиясөзді енгізіңіз.",
          fallbackError: "Кіру мүмкін болмады. Қайталап көріңіз.",
          googleError: "Google арқылы кіру мүмкін болмады.",
          noAccount: "Тіркелгі жоқ па?",
          register: "Тіркелу",
          googleUnavailable: "Google арқылы кіру client id қосылғаннан кейін пайда болады",
          features: [
            { icon: Brain, text: "Сабақтардағы прогресс автоматты сақталады" },
            { icon: Trophy, text: "Сөздік пен тесттерге жылдам қолжеткізу" },
            { icon: Zap, text: "Контент менеджеріне арналған кабинет" },
          ],
        };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigateAfterSuccess = () => {
    if (redirectAfterLogin) {
      onNavigate(redirectAfterLogin);
      setRedirectAfterLogin(null);
      return;
    }
    onNavigate("dashboard");
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError(copy.fillError);
      return;
    }

    setLoading(true);
    try {
      const tokens = await authService.login({ username: email, password });
      await loginWithTokens(tokens);
      navigateAfterSuccess();
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError, copy.fallbackError));
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
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError, copy.googleError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.12),transparent_28%)]"
      />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
        className="relative mx-auto grid w-full max-w-6xl gap-6 lg:min-h-[640px] lg:grid-cols-[1fr_0.9fr] lg:items-stretch"
      >
        <section className="flex rounded-3xl border border-border/70 bg-card/70 p-6 shadow-lg backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex max-w-xl flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {copy.eyebrow}
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {copy.title}
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {copy.subtitle}
              </p>
            </div>

            <div className="mt-10 grid gap-3">
              {copy.features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.text}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium text-foreground">{feature.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <CardGlow className="p-6 shadow-lg sm:p-8 lg:p-10" glowColor="rgba(99, 102, 241, 0.18)">
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              void handleLogin();
            }}
          >
            {error ? (
              <div
                role="alert"
                className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            <Input
              label={copy.email}
              type="email"
              value={email}
              autoComplete="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="h-5 w-5" aria-hidden="true" />}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Input
              label={copy.password}
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-5 w-5" aria-hidden="true" />}
              rightIcon={
                <button
                  type="button"
                  aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                  className="interactive rounded-md text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              }
              onChange={(event) => setPassword(event.target.value)}
            />

            <Button type="submit" size="lg" fullWidth loading={loading} loadingText={copy.submitting}>
              {copy.submit}
            </Button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Google
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {googleEnabled ? (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(response) => {
                    if (response.credential) {
                      void handleGoogleLogin(response.credential);
                    }
                  }}
                  onError={() => setError(copy.googleError)}
                  theme={theme === "dark" ? "filled_black" : "outline"}
                  size="large"
                  text="continue_with"
                  shape="pill"
                  width="360"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                {copy.googleUnavailable}
              </div>
            )}

            <p className="pt-2 text-center text-sm text-muted-foreground">
              {copy.noAccount}{" "}
              <button
                type="button"
                onClick={() => onNavigate("register")}
                className="interactive rounded-md font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.register}
              </button>
            </p>
          </form>
        </CardGlow>
      </motion.div>
    </div>
  );
};

export default LoginPage;
