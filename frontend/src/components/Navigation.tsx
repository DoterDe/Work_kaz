import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenCheck,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { Button } from "./ui/Button";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = [
    { label: "Home", page: "home", icon: Home },
    ...(isAuthenticated
      ? [
          { label: "Catalog", page: "catalog", icon: Library },
          { label: "Vocabulary", page: "vocabulary", icon: BookOpenCheck },
          { label: "Dashboard", page: "dashboard", icon: LayoutDashboard },
          ...(user?.is_content_manager
            ? [{ label: "Studio", page: "studio", icon: Sparkles }]
            : []),
        ]
      : []),
  ];

  const closeAndNavigate = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAndNavigate("home");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <button
          className="rounded-xl px-2 py-1 text-left transition-colors hover:bg-muted"
          onClick={() => onNavigate("home")}
        >
          <div className="text-lg font-semibold">Qazaq Video Learn</div>
          <div className="text-xs text-muted-foreground">Learn with real lessons</div>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {items.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          {!isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={() => onNavigate("login")}>
                Login
              </Button>
              <Button onClick={() => onNavigate("register")}>Register</Button>
            </>
          ) : (
            <>
              <button
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                onClick={() => onNavigate("dashboard")}
              >
                <User className="h-4 w-4" />
                {user?.username || "Account"}
              </button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-xl p-2 transition-colors hover:bg-muted md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-border bg-card md:hidden"
          >
            <div className="space-y-2 p-4">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.page}
                    className="inline-flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-muted"
                    onClick={() => closeAndNavigate(item.page)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}

              {!isAuthenticated ? (
                <>
                  <Button className="w-full" variant="ghost" onClick={() => closeAndNavigate("login")}>
                    Login
                  </Button>
                  <Button className="w-full" onClick={() => closeAndNavigate("register")}>
                    Register
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full" variant="ghost" onClick={() => closeAndNavigate("dashboard")}>
                    Dashboard
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
