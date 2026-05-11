import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { HomePage } from './components/HomePage';
import { VideoLessonPage } from './components/VideoLessonPage';
import { LessonsCatalog } from './components/LessonsCatalog';
import { Dashboard } from './components/Dashboard';
import { VocabularyPage } from './components/VocabularyPage';
import { UIKitShowcase } from './components/UIKitShowcase';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'lesson':
        return <VideoLessonPage onNavigate={handleNavigate} />;
      case 'catalog':
        return <LessonsCatalog onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'vocabulary':
        return <VocabularyPage onNavigate={handleNavigate} />;
      case 'uikit':
        return <UIKitShowcase onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      {/* UI Kit Access Button - Fixed position */}
      <button
        onClick={() => setCurrentPage('uikit')}
        className="fixed bottom-24 md:bottom-8 right-8 z-40 px-4 py-2 bg-accent text-accent-foreground rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium"
      >
        🎨 UI Kit
      </button>
      
      <main className="flex-1 pb-20 md:pb-0">
        {renderPage()}
      </main>
      
      <Footer />
      
      <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}