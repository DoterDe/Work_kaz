import React, { useEffect, useState } from "react";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { MobileNav } from "./components/MobileNav";
import { CustomCursor } from "./components/motion/CustomCursor";

import { HomePage } from "./components/HomePage";
import { VideoLessonPage } from "./components/VideoLessonPage";
import { LessonsCatalog } from "./components/LessonsCatalog";
import { Dashboard } from "./pages/Dashboard";
import { VocabularyPage } from "./components/VocabularyPage";
import { UIKitShowcase } from "./components/UIKitShowcase";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ContentStudioPage } from "./pages/ContentStudioPage";

import { useAuth } from "./auth/AuthContext";

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  level: "A1" | "A2" | "B1" | "B2";
  duration_minutes?: number;
  duration?: number;
  category?: string;
  thumbnail?: string;
  rating?: number;
  youtube_id?: string;
  progress?: number;
}

type PageId =
  | "home"
  | "catalog"
  | "lesson"
  | "vocabulary"
  | "dashboard"
  | "login"
  | "register"
  | "uikit"
  | "studio";

export default function App() {
  const { isAuthenticated, user } = useAuth();

  const [currentPage, setCurrentPage] = useState<PageId>("home");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const [visitedPages, setVisitedPages] = useState<PageId[]>(["home"]);
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({
    home: 0,
  });

  const handleNavigate = (page: string, lesson?: Lesson) => {
    const targetPage = page as PageId;
    const currentScrollY = window.scrollY;
    setScrollPositions((prev) => ({
      ...prev,
      [currentPage]: currentScrollY,
      ...(targetPage === "lesson" && lesson ? { lesson: 0 } : {}),
    }));
    if (lesson) setSelectedLesson(lesson);
    setCurrentPage(targetPage);
    setVisitedPages((prev) => (prev.includes(targetPage) ? prev : [...prev, targetPage]));
  };

  useEffect(() => {
    const nextScrollTop = scrollPositions[currentPage] ?? 0;
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: nextScrollTop,
        behavior: "auto",
      });
    });
  }, [currentPage, scrollPositions]);

  const renderPage = (page: PageId) => {
    switch (page) {
      case "home":
        return (
          <HomePage
            onNavigate={handleNavigate}
            redirectAfterLogin={redirectAfterLogin}
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        );

      case "catalog":
        return isAuthenticated ? (
          <LessonsCatalog
            onNavigate={handleNavigate}
          />
        ) : (
          <LoginPage
            onNavigate={handleNavigate}
            redirectAfterLogin="catalog"
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        );

      case "lesson":
        return isAuthenticated ? (
          selectedLesson ? (
            <VideoLessonPage
              lesson={selectedLesson}
              onNavigate={handleNavigate}
            />
          ) : (
            <LessonsCatalog onNavigate={handleNavigate} />
          )
        ) : (
          <LoginPage
            onNavigate={handleNavigate}
            redirectAfterLogin="lesson"
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        );

      case "vocabulary":
        return isAuthenticated ? (
          <VocabularyPage onNavigate={handleNavigate} />
        ) : (
          <LoginPage
            onNavigate={handleNavigate}
            redirectAfterLogin="vocabulary"
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        );

      case "dashboard":
        return isAuthenticated ? (
          <Dashboard onNavigate={handleNavigate} />
        ) : (
          <LoginPage
            onNavigate={handleNavigate}
            redirectAfterLogin="dashboard"
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        );

      case "login":
        return (
          <LoginPage
            onNavigate={handleNavigate}
            redirectAfterLogin={redirectAfterLogin}
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        );

      case "register":
        return (
          <RegisterPage
            onNavigate={handleNavigate}
            redirectAfterLogin={redirectAfterLogin}
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        );

      case "uikit":
        return <UIKitShowcase onNavigate={handleNavigate} />;

      case "studio":
        return isAuthenticated && user?.is_content_manager ? (
          <ContentStudioPage onNavigate={handleNavigate} />
        ) : (
          <LoginPage
            onNavigate={handleNavigate}
            redirectAfterLogin="studio"
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        );

      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            redirectAfterLogin={redirectAfterLogin}
            setRedirectAfterLogin={setRedirectAfterLogin}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <CustomCursor />
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="relative z-content flex-1 pb-20 md:pb-0">
        {visitedPages.map((page) => (
          <section
            key={page}
            className={currentPage === page ? "animate-page-enter" : "hidden"}
            aria-hidden={currentPage !== page}
          >
            {renderPage(page)}
          </section>
        ))}
      </main>

      <Footer onNavigate={handleNavigate} />
      <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}
