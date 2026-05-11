import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { VocabularyCard } from './ui/VocabularyCard';
import { SearchInput } from './ui/SearchInput';
import { BookOpen, Brain, Target, RotateCw } from 'lucide-react';

interface VocabularyPageProps {
  onNavigate: (page: string) => void;
}

export function VocabularyPage({ onNavigate }: VocabularyPageProps) {
  const [mode, setMode] = useState<'learn' | 'flashcards' | 'test'>('flashcards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Greetings', 'Numbers', 'Family', 'Food', 'Travel', 'Work', 'Time'];
  
  const vocabularyWords = [
    { 
      word: 'Сәлем', 
      pronunciation: '/sɑːˈlem/', 
      translation: 'Hello', 
      example: 'Сәлем, қалайсың?',
      category: 'Greetings',
      saved: true 
    },
    { 
      word: 'Қалайсың?', 
      pronunciation: '/qɑˈlɑjsɯŋ/', 
      translation: 'How are you?', 
      example: 'Сәлем, қалайсың? - Жақсы, рахмет!',
      category: 'Greetings',
      saved: true 
    },
    { 
      word: 'Рахмет', 
      pronunciation: '/rɑχˈmet/', 
      translation: 'Thank you', 
      example: 'Рахмет көмегің үшін',
      category: 'Greetings',
      saved: false 
    },
    { 
      word: 'Кешіріңіз', 
      pronunciation: '/keʃiˈriŋiz/', 
      translation: 'Excuse me / Sorry', 
      example: 'Кешіріңіз, мен кешігіп қалдым',
      category: 'Greetings',
      saved: false 
    },
    { 
      word: 'Бір', 
      pronunciation: '/bir/', 
      translation: 'One', 
      example: 'Бір алма',
      category: 'Numbers',
      saved: true 
    },
    { 
      word: 'Екі', 
      pronunciation: '/jeki/', 
      translation: 'Two', 
      example: 'Екі кітап',
      category: 'Numbers',
      saved: false 
    },
    { 
      word: 'Ата', 
      pronunciation: '/ɑˈtɑ/', 
      translation: 'Grandfather', 
      example: 'Менің атам',
      category: 'Family',
      saved: true 
    },
    { 
      word: 'Әже', 
      pronunciation: '/æˈʒe/', 
      translation: 'Grandmother', 
      example: 'Әже үйде',
      category: 'Family',
      saved: false 
    },
    { 
      word: 'Нан', 
      pronunciation: '/nɑn/', 
      translation: 'Bread', 
      example: 'Нан жеймін',
      category: 'Food',
      saved: true 
    },
    { 
      word: 'Су', 
      pronunciation: '/su/', 
      translation: 'Water', 
      example: 'Су ішемін',
      category: 'Food',
      saved: false 
    },
    { 
      word: 'Қайда', 
      pronunciation: '/qɑjˈdɑ/', 
      translation: 'Where', 
      example: 'Қайда барасың?',
      category: 'Travel',
      saved: true 
    },
    { 
      word: 'Жұмыс', 
      pronunciation: '/ʒʊˈmɯs/', 
      translation: 'Work', 
      example: 'Мен жұмыстамын',
      category: 'Work',
      saved: false 
    },
  ];
  
  const filteredWords = vocabularyWords.filter(word => {
    const matchesSearch = 
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || word.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const stats = [
    { label: 'Total Words', value: vocabularyWords.length, icon: BookOpen, color: 'text-primary' },
    { label: 'Learning', value: '23', icon: Brain, color: 'text-accent-foreground' },
    { label: 'Mastered', value: '156', icon: Target, color: 'text-secondary' },
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4">Vocabulary Practice</h1>
        <p className="text-xl text-muted-foreground">
          Build your Kazakh vocabulary with interactive flashcards
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Mode Selector */}
      <Card className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'learn' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('learn')}
            >
              <BookOpen className="w-4 h-4" />
              Learn
            </Button>
            <Button
              variant={mode === 'flashcards' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('flashcards')}
            >
              <RotateCw className="w-4 h-4" />
              Flashcards
            </Button>
            <Button
              variant={mode === 'test' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('test')}
            >
              <Target className="w-4 h-4" />
              Test
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            Reset Progress
          </Button>
        </div>
      </Card>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="mb-4">
          <SearchInput 
            placeholder="Search vocabulary..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Flashcards Mode */}
      {mode === 'flashcards' && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2>Flashcards</h2>
            <div className="text-sm text-muted-foreground">
              {filteredWords.length} cards
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word, index) => (
              <VocabularyCard 
                key={index}
                {...word}
                onToggleSave={() => {}}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Learn Mode */}
      {mode === 'learn' && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2>Learn Mode</h2>
            <div className="text-sm text-muted-foreground">
              {filteredWords.length} words
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredWords.map((word, index) => (
              <Card key={index} hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3>{word.word}</h3>
                      <span className="text-sm text-muted-foreground italic">
                        {word.pronunciation}
                      </span>
                    </div>
                    <p className="text-lg mb-2">{word.translation}</p>
                    <p className="text-sm text-muted-foreground italic">
                      Example: {word.example}
                    </p>
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {word.category}
                      </span>
                    </div>
                  </div>
                  <button className="p-3 hover:bg-muted rounded-full transition-colors">
                    <BookOpen className={`w-5 h-5 ${word.saved ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Test Mode */}
      {mode === 'test' && (
        <div>
          <div className="mb-6">
            <h2 className="mb-2">Vocabulary Test</h2>
            <p className="text-muted-foreground">
              Test your knowledge of {filteredWords.length} words
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm mb-4">
                Question 1 of {filteredWords.length}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-center mb-6">What does "Сәлем" mean?</h3>
              
              <div className="space-y-3">
                {['Hello', 'Goodbye', 'Thank you', 'Please'].map((option, index) => (
                  <button
                    key={index}
                    className="w-full p-4 bg-muted/50 rounded-2xl hover:bg-primary/5 border-2 border-transparent hover:border-primary transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-border">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1">
                Skip
              </Button>
              <Button variant="primary" size="lg" className="flex-1">
                Next Question
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {filteredWords.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No vocabulary words found</p>
        </Card>
      )}
    </div>
  );
}
