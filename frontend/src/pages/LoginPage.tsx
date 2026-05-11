import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { LockKeyhole, Sparkles, Waves, ShieldCheck } from "lucide-react";

import { authService } from "../api/auth.service";
import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { Button } from "../components/ui/Button";
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
  const { language } = useAppPreferences();

  const copy =
    language === "ru"
      ? {
          eyebrow: "Личный кабинет",
          title: "Вернитесь к урокам без лишних шагов",
          subtitle:
            "Ваш прогресс, словарь и тесты уже ждут. Войдите и продолжайте учёбу в своём темпе.",
          username: "Имя пользователя",
          password: "Пароль",
          submit: "Войти",
          submitting: "Входим...",
          fillError: "Введите имя пользователя и пароль.",
          fallbackError: "Не удалось выполнить вход. Попробуйте ещё раз.",
          googleError: "Не удалось выполнить вход через Google.",
          noAccount: "Нет аккаунта?",
          register: "Создать профиль",
          googleHint: "Google-вход появится после добавления client id в frontend env.",
          features: [
            "Синхронизация прогресса между уроками и тестами",
            "Быстрый доступ к словарю и истории квизов",
            "Отдельный кабинет контент-менеджера для студии",
          ],
        }
      : {
          eyebrow: "Жеке кабинет",
          title: "Сабақтарға артық қадамсыз қайта оралыңыз",
          subtitle:
            "Сіздің прогресіңіз, сөздігіңіз және тесттеріңіз дайын тұр. Кіріп, өз ырғағыңызбен оқуды жалғастырыңыз.",
          username: "Пайдаланушы аты",
          password: "Құпиясөз",
          submit: "Кіру",
          submitting: "Кіріп жатырмыз...",
          fillError: "Пайдаланушы аты мен құпиясөзді енгізіңіз.",
          fallbackError: "Кіру мүмкін болмады. Қайталап көріңіз.",
          googleError: "Google арқылы кіру мүмкін болмады.",
          noAccount: "Тіркелгі жоқ па?",
          register: "Профиль ашу",
          googleHint: "Google кіруі frontend env ішіне client id қосылғаннан кейін пайда болады.",
          features: [
            "Сабақтар мен тесттердегі прогресті синхрондау",
            "Сөздікке және квиз тарихына жылдам қолжеткізу",
            "Контент студиясына арналған жеке менеджер кабинеті",
          ],
        };

  const [username, setUsername] = useState("");
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

  const handleLogin = async () => {
    setError("");
    if (!username || !password) {
      setError(copy.fillError);
      return;
    }

    setLoading(true);
    try {
      const tokens = await authService.login({ username, password });
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
    <section className="relative overflow-hidden px-4 py-12 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(28,110,250,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(0,143,90,0.18),transparent_36%)]" />
      <div className="absolute left-12 top-12 h-32 w-32 rounded-full border border-primary/20 bg-primary/10 blur-2xl" />
      <div className="absolute bottom-10 right-12 h-40 w-40 rounded-full border border-secondary/20 bg-secondary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto grid max-w-5xl overflow-hidden rounded-[34px] border border-border bg-card/95 shadow-2xl lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="relative border-b border-border px-7 py-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            {copy.eyebrow}
          </div>
          <h1 className="mb-4 text-4xl leading-tight lg:text-5xl">{copy.title}</h1>
          <p className="max-w-xl text-base text-muted-foreground lg:text-lg">
            {copy.subtitle}
          </p>

          <div className="mt-8 grid gap-4">
            {copy.features.map((feature, index) => {
              const Icon = index === 0 ? Waves : index === 1 ? ShieldCheck : LockKeyhole;
              return (
                <div
                  key={feature}
                  className="rounded-[24px] border border-border bg-background/60 p-4"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{feature}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-7 py-8 lg:px-10 lg:py-10">
          {error && (
            <div className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-muted-foreground">{copy.username}</span>
              <input
                placeholder={copy.username}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-border bg-input-background px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-muted-foreground">{copy.password}</span>
              <input
                type="password"
                placeholder={copy.password}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-input-background px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <Button className="mt-6 w-full" size="lg" onClick={handleLogin} disabled={loading}>
            {loading ? copy.submitting : copy.submit}
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>Google</span>
            <span className="h-px flex-1 bg-border" />
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
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-4 text-center text-sm text-muted-foreground">
              {copy.googleHint}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {copy.noAccount}{" "}
            <button className="text-primary hover:text-[#1557CC]" onClick={() => onNavigate("register")}>
              {copy.register}
            </button>
          </p>
        </div>
      </motion.div>
    </section>
  );
};
