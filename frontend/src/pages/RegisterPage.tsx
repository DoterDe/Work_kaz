import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { BookHeart, BadgeCheck, Globe2, Sparkles } from "lucide-react";

import { authService } from "../api/auth.service";
import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { Button } from "../components/ui/Button";
import { extractApiErrorMessage } from "../utils/apiError";

interface RegisterPageProps {
  onNavigate: (page: string) => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (page: string | null) => void;
}

const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  redirectAfterLogin,
  setRedirectAfterLogin,
}) => {
  const { loginWithTokens } = useAuth();
  const { language } = useAppPreferences();

  const copy =
    language === "ru"
      ? {
          eyebrow: "Новый профиль",
          title: "Создайте красивый старт для изучения казахского",
          subtitle:
            "Откройте персональный кабинет, сохраняйте результаты и выстраивайте свою траекторию без хаоса.",
          username: "Имя пользователя",
          email: "Электронная почта",
          password: "Пароль",
          submit: "Создать аккаунт",
          submitting: "Создаём аккаунт...",
          fillError: "Заполните все поля формы.",
          fallbackError: "Не удалось завершить регистрацию. Попробуйте ещё раз.",
          googleError: "Не удалось выполнить вход через Google.",
          haveAccount: "Уже есть аккаунт?",
          login: "Войти",
          googleHint: "Google-регистрация появится после добавления client id в frontend env.",
          benefits: [
            "Сохраняйте личный прогресс по каждому уроку",
            "Собирайте собственную базу слов и квиз-историю",
            "Получайте доступ к аккуратному кабинету с аналитикой",
          ],
        }
      : {
          eyebrow: "Жаңа профиль",
          title: "Қазақ тілін үйренуге әдемі бастама жасаңыз",
          subtitle:
            "Жеке кабинет ашып, нәтижелерді сақтап, өз траекторияңызды артық әбігерсіз құрыңыз.",
          username: "Пайдаланушы аты",
          email: "Электрондық пошта",
          password: "Құпиясөз",
          submit: "Тіркелгі жасау",
          submitting: "Тіркелгі жасалып жатыр...",
          fillError: "Формадағы барлық өрістерді толтырыңыз.",
          fallbackError: "Тіркелу сәтсіз болды. Қайтадан көріңіз.",
          googleError: "Google арқылы кіру мүмкін болмады.",
          haveAccount: "Тіркелгі бар ма?",
          login: "Кіру",
          googleHint: "Google арқылы тіркелу frontend env ішіне client id қосылған соң пайда болады.",
          benefits: [
            "Әр сабақ бойынша жеке прогресті сақтаңыз",
            "Өз сөзіңіз бен квиз тарихыңызды жинаңыз",
            "Таза аналитикасы бар кабинетке қол жеткізіңіз",
          ],
        };

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
      setError(copy.fillError);
      return;
    }

    setLoading(true);
    try {
      await authService.register({ username, email, password });
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,211,78,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(28,110,250,0.16),transparent_42%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto grid max-w-5xl overflow-hidden rounded-[34px] border border-border bg-card/95 shadow-2xl lg:grid-cols-[0.86fr_1.14fr]"
      >
        <div className="border-b border-border px-7 py-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm text-secondary">
            <Sparkles className="h-4 w-4" />
            {copy.eyebrow}
          </div>
          <h1 className="mb-4 text-4xl leading-tight lg:text-5xl">{copy.title}</h1>
          <p className="text-base text-muted-foreground lg:text-lg">{copy.subtitle}</p>

          <div className="mt-8 space-y-4">
            {copy.benefits.map((item, index) => {
              const Icon = index === 0 ? BadgeCheck : index === 1 ? BookHeart : Globe2;
              return (
                <div key={item} className="rounded-[24px] border border-border bg-background/60 p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
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

          <div className="grid gap-4">
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
              <span className="mb-2 block text-sm text-muted-foreground">{copy.email}</span>
              <input
                type="email"
                placeholder={copy.email}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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

          <Button className="mt-6 w-full" size="lg" onClick={handleRegister} disabled={loading}>
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
            {copy.haveAccount}{" "}
            <button className="text-primary hover:text-[#1557CC]" onClick={() => onNavigate("login")}>
              {copy.login}
            </button>
          </p>
        </div>
      </motion.div>
    </section>
  );
};
