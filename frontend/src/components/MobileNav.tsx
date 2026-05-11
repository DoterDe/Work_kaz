import React from "react";
import { BookOpen, GraduationCap, Home, Sparkles, User } from "lucide-react";

import { useAuth } from "../auth/AuthContext";

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", page: "home" },
    ...(isAuthenticated
      ? [
          { icon: BookOpen, label: "Lessons", page: "catalog" },
          { icon: GraduationCap, label: "Words", page: "vocabulary" },
          ...(user?.is_content_manager
            ? [{ icon: Sparkles, label: "Studio", page: "studio" }]
            : [{ icon: User, label: "Profile", page: "dashboard" }]),
        ]
      : [{ icon: User, label: "Login", page: "login" }]),
  ];

  return (
    <nav className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
