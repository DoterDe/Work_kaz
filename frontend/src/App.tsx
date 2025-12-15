import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';

import { HomePage } from './pages/HomePage';
import { VideoLessonPage } from './components/VideoLessonPage';
import { LessonsCatalog } from './components/LessonsCatalog';
import { Dashboard } from './pages/Dashboard';
import { VocabularyPage } from './components/VocabularyPage';
import { UIKitShowcase } from './components/UIKitShowcase';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import api from './api/axios';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [backendMessage, setBackendMessage] = useState<string>('Загрузка...');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    api.get('test/')
      .then(res => setBackendMessage(res.data.message))
      .catch(() => setBackendMessage('Ошибка подключения к Django'));
  }, []);

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

      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      {/* UI Kit Access Button */}
      <button
        onClick={() => setCurrentPage('uikit')}
        className="fixed bottom-24 md:bottom-8 right-8 z-40 px-4 py-2 bg-accent text-accent-foreground rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium"
      >
        🎨 UI Kit
      </button>

      <main className="flex-1 pb-20 md:pb-0">
        <p className="text-center text-sm text-gray-500 mb-4">{backendMessage}</p>
        {renderPage()}
      </main>

      <Footer />
      <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}
