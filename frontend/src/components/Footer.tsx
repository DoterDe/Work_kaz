import React from "react";
import { Facebook, Instagram, Mail, Youtube } from "lucide-react";

import { useAuth } from "../auth/AuthContext";

interface FooterProps {
  onNavigate: (page: string) => void;
}

const supportEmail = "support@qazaqvideolearn.com";

export function Footer({ onNavigate }: FooterProps) {
  const { isAuthenticated, user } = useAuth();

  const scrollToSection = (sectionId: string) => {
    onNavigate("home");
    window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 90);
  };

  const openSupportEmail = (subject: string) => {
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1">
            <button
              className="mb-4 flex items-center gap-3 rounded-2xl pr-3 text-left transition-colors hover:text-primary"
              onClick={() => onNavigate("home")}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
                <span className="text-xl text-white">Q</span>
              </div>
              <div className="text-lg font-semibold">Qazaq Video Learn</div>
            </button>
            <p className="text-sm text-muted-foreground">
              Learn Kazakh through structured video lessons, vocabulary practice, and
              progress tracking.
            </p>
          </div>

          <div>
            <h4 className="mb-4">Learn</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => onNavigate("catalog")}
                >
                  Beginner (A1-A2)
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => onNavigate("catalog")}
                >
                  Intermediate (B1-B2)
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => onNavigate("catalog")}
                >
                  Video Lessons
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => onNavigate(isAuthenticated ? "vocabulary" : "login")}
                >
                  Vocabulary
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() =>
                    onNavigate(
                      isAuthenticated
                        ? user?.is_content_manager
                          ? "studio"
                          : "dashboard"
                        : "login"
                    )
                  }
                >
                  {user?.is_content_manager ? "Content Studio" : "Dashboard"}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => scrollToSection("faq-section")}
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => scrollToSection("support-section")}
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  className="transition-colors hover:text-primary"
                  onClick={() => openSupportEmail("Qazaq Video Learn Support")}
                >
                  Contact Us
                </button>
              </li>
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary hover:text-white"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary hover:text-white"
                onClick={() => openSupportEmail("Qazaq Video Learn Feedback")}
              >
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>(c) 2026 Qazaq Video Learn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
