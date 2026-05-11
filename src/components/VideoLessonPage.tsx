import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { LevelBadge } from './ui/LevelBadge';
import { VocabularyCard } from './ui/VocabularyCard';
import { ProgressBar } from './ui/ProgressBar';

const PlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="6 3 20 12 6 21 6 3"></polygon>
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
  </svg>
);

const Volume2Icon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const MaximizeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
    <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
    <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
    <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6"></path>
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"></path>
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

interface VideoLessonPageProps {
  onNavigate: (page: string) => void;
}

export function VideoLessonPage({ onNavigate }: VideoLessonPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [subtitleMode, setSubtitleMode] = useState('both'); // 'kazakh', 'russian', 'both'
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  const vocabularyWords = [
    { word: 'Сәлем', pronunciation: '/sɑːˈlem/', translation: 'Hello', example: 'Сәлем, қалайсың?' },
    { word: 'Қалайсың?', pronunciation: '/qɑˈlɑjsɯŋ/', translation: 'How are you?', example: 'Сәлем, қ��лайсың?' },
    { word: 'Рахмет', pronunciation: '/rɑχˈmet/', translation: 'Thank you', example: 'Рахмет көмегің үшін' },
    { word: 'Кешіріңіз', pronunciation: '/keʃiˈriŋiz/', translation: 'Excuse me / Sorry', example: 'Кешіріңіз, сіз қайдасыз?' },
  ];
  
  const transcriptLines = [
    { time: '0:05', kazakh: 'Сәлем! Менің атым Айгүл.', russian: 'Привет! Меня зовут Айгуль.', id: 1 },
    { time: '0:08', kazakh: 'Бүгін біз амандасуды үйренеміз.', russian: 'Сегодня мы учимся здороваться.', id: 2 },
    { time: '0:12', kazakh: 'Қалайсың? - Бұл "Как дела?" деген сөз.', russian: 'Қалайсың? - Это означает "Как дела?"', id: 3 },
    { time: '0:16', kazakh: 'Рахмет - "Спасибо" деген мағына.', russian: 'Рахмет - означает "Спасибо".', id: 4 },
  ];
  
  const practiceQuestions = [
    {
      type: 'choice',
      question: 'What does "Сәлем" mean?',
      options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
      correct: 0
    },
    {
      type: 'fill',
      question: 'Complete: Сәлем, _____ ?',
      answer: 'қалайсың'
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => onNavigate('catalog')}
      >
        <ChevronLeftIcon className="w-5 h-5" />
        Back to Courses
      </Button>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <Card className="p-0 overflow-hidden mb-6">
            <div className="relative aspect-video bg-black">
              <img 
                src="https://images.unsplash.com/photo-1573496774379-b930dba17d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHRlYWNoZXIlMjBzcGVha2luZ3xlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Video lesson"
                className="w-full h-full object-cover opacity-70"
              />
              
              {/* Play/Pause Button */}
              <button 
                className="absolute inset-0 flex items-center justify-center group"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isPlaying ? (
                    <PauseIcon className="w-10 h-10 text-primary" />
                  ) : (
                    <PlayIcon className="w-10 h-10 text-primary ml-1" />
                  )}
                </div>
              </button>
              
              {/* Subtitles */}
              <div className="absolute bottom-20 left-0 right-0 text-center px-8">
                <div className="bg-black/80 rounded-2xl px-6 py-4 inline-block">
                  {(subtitleMode === 'kazakh' || subtitleMode === 'both') && (
                    <p className="text-white text-lg mb-1">Сәлем! Менің атым Айгүл.</p>
                  )}
                  {(subtitleMode === 'russian' || subtitleMode === 'both') && (
                    <p className="text-white/80 text-sm">Привет! Меня зовут Айгуль.</p>
                  )}
                </div>
              </div>
              
              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <ProgressBar progress={35} color="accent" height="sm" />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button className="text-white hover:text-accent transition-colors">
                      {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    </button>
                    <button className="text-white hover:text-accent transition-colors">
                      <Volume2Icon className="w-5 h-5" />
                    </button>
                    <span className="text-white text-sm">2:15 / 8:30</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-white hover:text-accent transition-colors">
                      <SettingsIcon className="w-5 h-5" />
                    </button>
                    <button className="text-white hover:text-accent transition-colors">
                      <MaximizeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subtitle Controls */}
            <div className="p-4 bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Subtitles:</span>
                <div className="flex gap-2">
                  {['kazakh', 'russian', 'both'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSubtitleMode(mode)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        subtitleMode === mode
                          ? 'bg-primary text-white'
                          : 'bg-white hover:bg-muted'
                      }`}
                    >
                      {mode === 'kazakh' ? '🇰🇿 Kazakh' : mode === 'russian' ? '🇷🇺 Russian' : '🇰🇿🇷🇺 Both'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b border-border">
              {['Transcript', 'Vocabulary', 'Practice', 'Comments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setShowTranscript(tab === 'Transcript')}
                  className={`px-6 py-3 border-b-2 transition-colors ${
                    (showTranscript && tab === 'Transcript') || (!showTranscript && tab !== 'Transcript')
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Transcript */}
          {showTranscript ? (
            <Card>
              <h3 className="mb-4 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5" />
                Interactive Transcript
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click on any word to see its translation and save to your vocabulary list
              </p>
              <div className="space-y-4">
                {transcriptLines.map((line) => (
                  <div key={line.id} className="p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors cursor-pointer">
                    <div className="text-xs text-primary mb-2">{line.time}</div>
                    <p className="mb-1">
                      {line.kazakh.split(' ').map((word, i) => (
                        <span
                          key={i}
                          className="hover:bg-accent/30 px-1 rounded cursor-pointer transition-colors"
                          onClick={() => setSelectedWord(word)}
                        >
                          {word}{' '}
                        </span>
                      ))}
                    </p>
                    <p className="text-sm text-muted-foreground">{line.russian}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <h3 className="mb-4">Practice Exercises</h3>
              <div className="space-y-6">
                {practiceQuestions.map((q, i) => (
                  <div key={i} className="p-4 bg-muted/50 rounded-2xl">
                    <p className="mb-4">{q.question}</p>
                    {q.type === 'choice' && (
                      <div className="space-y-2">
                        {q.options?.map((option, j) => (
                          <button
                            key={j}
                            className="w-full text-left p-3 bg-white rounded-xl hover:bg-primary/5 border border-border transition-colors"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    {q.type === 'fill' && (
                      <input
                        type="text"
                        placeholder="Type your answer..."
                        className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>
                ))}
                <Button variant="primary" size="lg" className="w-full">
                  <CheckCircleIcon className="w-5 h-5" />
                  Check Answers
                </Button>
              </div>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Lesson Info */}
          <Card className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h3>Greetings & Introductions</h3>
              <LevelBadge level="A1" />
            </div>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>8:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty</span>
                <span>Beginner</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vocabulary</span>
                <span>12 words</span>
              </div>
            </div>
            <ProgressBar progress={35} color="primary" showLabel />
          </Card>
          
          {/* Key Vocabulary */}
          <Card className="mb-6">
            <h3 className="mb-4">Key Vocabulary</h3>
            <div className="space-y-3">
              {vocabularyWords.slice(0, 4).map((word, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{word.word}</span>
                    <button className="text-muted-foreground hover:text-primary">
                      <Volume2Icon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">{word.translation}</div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => onNavigate('vocabulary')}
            >
              View All Words
            </Button>
          </Card>
          
          {/* Navigation */}
          <Card>
            <h4 className="mb-4">Lesson Navigation</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ChevronLeftIcon className="w-4 h-4" />
                Previous: Alphabet
              </Button>
              <Button variant="primary" size="sm" className="w-full justify-start">
                <ChevronRightIcon className="w-4 h-4" />
                Next: Numbers 1-10
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}