import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Sparkles, Mail, Lock, Eye, EyeOff, User, Brain, Trophy, Zap } from "lucide-react";

import { authService } from "../api/auth.service";
import { useAuth } from "../auth/AuthContext";
import { useAppPreferences } from "../context/AppPreferencesContext";
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
  const { language, theme } = useAppPreferences();

  const isDark = theme === "dark";

  const copy =
    language === "ru"
      ? {
          eyebrow: "Новый профиль",
          title: "Создайте аккаунт",
          subtitle: "Начните учиться с AI-репетитором",
          username: "Имя пользователя",
          email: "Email",
          password: "Пароль",
          submit: "Зарегистрироваться",
          submitting: "Регистрация...",
          fillError: "Заполните все поля",
          fallbackError: "Не удалось завершить регистрацию",
          googleError: "Не удалось выполнить вход через Google",
          haveAccount: "Уже есть аккаунт?",
          login: "Войти",
          googleHint: "Google-регистрация появится после добавления client id",
          features: [
            { icon: Brain, text: "Персональные AI-учителя" },
            { icon: Trophy, text: "Отслеживание прогресса" },
            { icon: Zap, text: "Доступ 24/7" },
          ],
        }
      : {
          eyebrow: "Жаңа профиль",
          title: "Аккаунт жасаңыз",
          subtitle: "AI-репетитормен оқуды бастаңыз",
          username: "Пайдаланушы аты",
          email: "Email",
          password: "Құпиясөз",
          submit: "Тіркелу",
          submitting: "Тіркелу...",
          fillError: "Барлық өрістерді толтырыңыз",
          fallbackError: "Тіркелу сәтсіз болды",
          googleError: "Google арқылы кіру мүмкін болмады",
          haveAccount: "Аккаунтыңыз бар ма?",
          login: "Кіру",
          googleHint: "Google арқылы тіркелу кейінірек қосылады",
          features: [
            { icon: Brain, text: "Жеке AI-мұғалімдер" },
            { icon: Trophy, text: "Прогресті бақылау" },
            { icon: Zap, text: "24/7 қолжетімділік" },
          ],
        };

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const textPrimary = isDark ? "text-white" : "text-black";
  const textSecondary = isDark ? "text-slate-300" : "text-gray-700";
  const textMuted = isDark ? "text-slate-400" : "text-gray-500";
  const borderColor = isDark ? "border-slate-700" : "border-gray-200";
  const bgInput = isDark ? "bg-slate-800/50" : "bg-gray-50";
  const bgCard = isDark ? "bg-slate-900/95" : "bg-white/95";
  const leftBg = isDark ? "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" : "bg-white";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(28,110,250,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(0,143,90,0.08),transparent_36%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-5xl mx-auto"
      >
        <div className={`grid lg:grid-cols-2 gap-6 overflow-hidden rounded-3xl backdrop-blur-sm shadow-2xl ${bgCard}`}>
          
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className={`p-8 lg:p-10 rounded-2xl ${leftBg}`}>
            <div className="relative">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-6 ${isDark ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"}`}>
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">{copy.eyebrow}</span>
              </div>
              
              <h1 className={`text-3xl font-bold leading-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                {copy.title}
              </h1>
              
              <p className={`text-base mb-8 leading-relaxed ${isDark ? "text-white/85" : "text-gray-600"}`}>
                {copy.subtitle}
              </p>

              <div className="space-y-4">
                {copy.features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 rounded-xl p-3 border ${isDark ? "bg-white/15 border-white/10" : "bg-gray-50 border-gray-100"}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-white/20" : "bg-gray-100"}`}>
                        <Icon className={`h-4 w-4 ${isDark ? "text-white" : "text-gray-600"}`} />
                      </div>
                      <p className={`text-sm font-medium ${isDark ? "text-white/90" : "text-gray-700"}`}>{feature.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА — форма регистрации */}
          <div className="p-8 lg:p-10 rounded-2xl">
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/30 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Поле Имя пользователя */}
              <div>
                <label className={`block text-base font-medium mb-2 ${textSecondary}`}>
                  {copy.username}
                </label>
                <div
                  className={`flex items-center gap-3 px-6 h-16 rounded-2xl border-2 transition-all duration-200 ${
                    usernameFocused
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : borderColor
                  } ${bgInput}`}
                >
                  <User size={20} className={usernameFocused ? "text-blue-500" : textMuted} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                    placeholder={copy.username}
                    className={`flex-1 bg-transparent outline-none text-base ${textPrimary} placeholder:${textMuted} py-0`}
                  />
                </div>
              </div>

              {/* Email поле */}
              <div>
                <label className={`block text-base font-medium mb-2 ${textSecondary}`}>
                  {copy.email}
                </label>
                <div
                  className={`flex items-center gap-3 px-6 h-16 rounded-2xl border-2 transition-all duration-200 ${
                    emailFocused
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : borderColor
                  } ${bgInput}`}
                >
                  <Mail size={20} className={emailFocused ? "text-blue-500" : textMuted} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="ivan@example.com"
                    className={`flex-1 bg-transparent outline-none text-base ${textPrimary} placeholder:${textMuted} py-0`}
                  />
                </div>
              </div>

              {/* Пароль поле */}
              <div>
                <label className={`block text-base font-medium mb-2 ${textSecondary}`}>
                  {copy.password}
                </label>
                <div
                  className={`flex items-center gap-3 px-6 h-16 rounded-2xl border-2 transition-all duration-200 ${
                    passwordFocused
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : borderColor
                  } ${bgInput}`}
                >
                  <Lock size={20} className={passwordFocused ? "text-blue-500" : textMuted} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="••••••••"
                    className={`flex-1 bg-transparent outline-none text-base ${textPrimary} placeholder:${textMuted} py-0`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`transition-colors ${textMuted} hover:text-blue-500`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Кнопка регистрации */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className={`
                    w-full max-w-md py-4 rounded-2xl font-semibold text-lg
                    transition-all duration-200
                    hover:scale-[1.02] active:scale-[0.98]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    shadow-md
                    bg-blue-600 text-white hover:bg-blue-700
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {copy.submitting}
                    </div>
                  ) : (
                    copy.submit
                  )}
                </button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <div className={`h-px flex-1 ${borderColor}`} />
                <span className={`text-sm ${textMuted}`}>Google</span>
                <div className={`h-px flex-1 ${borderColor}`} />
              </div>

              {/* Google кнопка */}
              <div className="flex justify-center">
                {googleEnabled ? (
                  <div className="w-full max-w-md">
                    <GoogleLogin
                      onSuccess={(response) => {
                        if (response.credential) {
                          void handleGoogleLogin(response.credential);
                        }
                      }}
                      onError={() => setError(copy.googleError)}
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="pill"
                      width="384"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full max-w-md py-4 rounded-2xl border-2 flex items-center justify-center gap-3 text-base font-medium transition-all duration-200"
                    style={{
                      backgroundColor: isDark ? "#1e293b" : "white",
                      borderColor: isDark ? "#475569" : "#d1d5db",
                      color: isDark ? "#cbd5e1" : "#374151",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Google</span>
                  </button>
                )}
              </div>

              <p className={`text-center text-base pt-4 ${textMuted}`}>
                {copy.haveAccount}{" "}
                <button
                  onClick={() => onNavigate("login")}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors text-base"
                >
                  {copy.login}
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;