import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { LevelBadge } from './ui/LevelBadge';
import { ProgressBar } from './ui/ProgressBar';
import { SearchInput } from './ui/SearchInput';
import { VocabularyCard } from './ui/VocabularyCard';
import { LessonCard } from './ui/LessonCard';
import { Play, BookOpen, Target, Award } from 'lucide-react';

interface UIKitShowcaseProps {
  onNavigate: (page: string) => void;
}

export function UIKitShowcase({ onNavigate }: UIKitShowcaseProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12">
        <h1 className="mb-4">Qazaq Video Learn - UI Kit</h1>
        <p className="text-xl text-muted-foreground">
          Complete design system and component library
        </p>
      </div>
      
      {/* Color Palette */}
      <section className="mb-16">
        <h2 className="mb-6">Color Palette</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <div className="w-full h-32 bg-primary rounded-2xl mb-4"></div>
            <h4>Primary Blue</h4>
            <p className="text-sm text-muted-foreground">#1C6EFA</p>
            <p className="text-xs text-muted-foreground mt-1">Main brand color, CTAs, links</p>
          </Card>
          
          <Card>
            <div className="w-full h-32 bg-secondary rounded-2xl mb-4"></div>
            <h4>Secondary Green</h4>
            <p className="text-sm text-muted-foreground">#008F5A</p>
            <p className="text-xs text-muted-foreground mt-1">Success, progress indicators</p>
          </Card>
          
          <Card>
            <div className="w-full h-32 bg-accent rounded-2xl mb-4"></div>
            <h4>Accent Yellow</h4>
            <p className="text-sm text-muted-foreground">#FFD34E</p>
            <p className="text-xs text-muted-foreground mt-1">Highlights, achievements</p>
          </Card>
          
          <Card>
            <div className="w-full h-32 bg-muted rounded-2xl mb-4"></div>
            <h4>Background</h4>
            <p className="text-sm text-muted-foreground">#F7F9FB</p>
            <p className="text-xs text-muted-foreground mt-1">Page background, subtle areas</p>
          </Card>
        </div>
      </section>
      
      {/* Typography */}
      <section className="mb-16">
        <h2 className="mb-6">Typography</h2>
        <Card className="space-y-6">
          <div>
            <h1>Heading 1 - 2.5rem (40px)</h1>
            <p className="text-sm text-muted-foreground">Used for main page titles</p>
          </div>
          <div>
            <h2>Heading 2 - 2rem (32px)</h2>
            <p className="text-sm text-muted-foreground">Used for section titles</p>
          </div>
          <div>
            <h3>Heading 3 - 1.5rem (24px)</h3>
            <p className="text-sm text-muted-foreground">Used for card titles and subsections</p>
          </div>
          <div>
            <h4>Heading 4 - 1rem (16px)</h4>
            <p className="text-sm text-muted-foreground">Used for small headings</p>
          </div>
          <div>
            <p>Body text - 1rem (16px) - Regular weight</p>
            <p className="text-sm text-muted-foreground">Standard paragraph text</p>
          </div>
          <div>
            <p className="text-muted-foreground">Muted text - #6D6D6D</p>
            <p className="text-sm text-muted-foreground">Secondary information, captions</p>
          </div>
        </Card>
      </section>
      
      {/* Buttons */}
      <section className="mb-16">
        <h2 className="mb-6">Buttons</h2>
        <Card>
          <div className="space-y-6">
            <div>
              <h4 className="mb-3">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="accent">Accent Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
            </div>
            
            <div>
              <h4 className="mb-3">Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Small Button</Button>
                <Button variant="primary" size="md">Medium Button</Button>
                <Button variant="primary" size="lg">Large Button</Button>
              </div>
            </div>
            
            <div>
              <h4 className="mb-3">With Icons</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">
                  <Play className="w-4 h-4" />
                  Start Learning
                </Button>
                <Button variant="secondary">
                  <BookOpen className="w-4 h-4" />
                  View Lessons
                </Button>
                <Button variant="outline">
                  <Award className="w-4 h-4" />
                  Achievements
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
      
      {/* Cards */}
      <section className="mb-16">
        <h2 className="mb-6">Cards</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <h4 className="mb-2">Basic Card</h4>
            <p className="text-sm text-muted-foreground">
              Standard card with rounded corners (24px), shadow, and padding
            </p>
          </Card>
          
          <Card hover>
            <h4 className="mb-2">Hover Card</h4>
            <p className="text-sm text-muted-foreground">
              Card with hover animation (lift and shadow)
            </p>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary to-secondary text-white border-0">
            <h4 className="mb-2 text-white">Gradient Card</h4>
            <p className="text-sm text-white/90">
              Card with gradient background for special content
            </p>
          </Card>
        </div>
      </section>
      
      {/* Level Badges */}
      <section className="mb-16">
        <h2 className="mb-6">Level Badges</h2>
        <Card>
          <div className="space-y-4">
            <div>
              <h4 className="mb-3">Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <LevelBadge level="A1" size="sm" />
                <LevelBadge level="A2" size="md" />
                <LevelBadge level="B1" size="lg" />
              </div>
            </div>
            
            <div>
              <h4 className="mb-3">All Levels</h4>
              <div className="flex flex-wrap gap-3">
                <LevelBadge level="A1" size="md" />
                <LevelBadge level="A2" size="md" />
                <LevelBadge level="B1" size="md" />
                <LevelBadge level="B2" size="md" />
              </div>
            </div>
          </div>
        </Card>
      </section>
      
      {/* Progress Bars */}
      <section className="mb-16">
        <h2 className="mb-6">Progress Indicators</h2>
        <Card className="space-y-6">
          <div>
            <h4 className="mb-3">Primary Progress</h4>
            <ProgressBar progress={65} color="primary" />
          </div>
          
          <div>
            <h4 className="mb-3">Secondary Progress</h4>
            <ProgressBar progress={45} color="secondary" />
          </div>
          
          <div>
            <h4 className="mb-3">Accent Progress</h4>
            <ProgressBar progress={85} color="accent" />
          </div>
          
          <div>
            <h4 className="mb-3">With Label</h4>
            <ProgressBar progress={72} color="primary" showLabel />
          </div>
          
          <div>
            <h4 className="mb-3">Sizes</h4>
            <div className="space-y-3">
              <ProgressBar progress={60} color="primary" height="sm" />
              <ProgressBar progress={60} color="primary" height="md" />
              <ProgressBar progress={60} color="primary" height="lg" />
            </div>
          </div>
        </Card>
      </section>
      
      {/* Input Fields */}
      <section className="mb-16">
        <h2 className="mb-6">Input Fields</h2>
        <Card className="space-y-4">
          <div>
            <h4 className="mb-3">Search Input</h4>
            <SearchInput placeholder="Search lessons..." />
          </div>
          
          <div>
            <h4 className="mb-3">Text Input</h4>
            <input
              type="text"
              placeholder="Enter text..."
              className="w-full px-4 py-3 bg-input-background border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </Card>
      </section>
      
      {/* Lesson Card */}
      <section className="mb-16">
        <h2 className="mb-6">Lesson Card Component</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <LessonCard
            title="Greetings & Introductions"
            level="A1"
            duration="8 min"
            thumbnail="https://images.unsplash.com/photo-1573496774379-b930dba17d8b?w=400"
            progress={0}
            onClick={() => {}}
          />
          
          <LessonCard
            title="Daily Conversations"
            level="A2"
            duration="12 min"
            thumbnail="https://images.unsplash.com/photo-1573496774379-b930dba17d8b?w=400"
            progress={45}
            onClick={() => {}}
          />
          
          <LessonCard
            title="Business Kazakh"
            level="B1"
            duration="15 min"
            thumbnail="https://images.unsplash.com/photo-1573496774379-b930dba17d8b?w=400"
            progress={100}
            onClick={() => {}}
          />
        </div>
      </section>
      
      {/* Vocabulary Card */}
      <section className="mb-16">
        <h2 className="mb-6">Vocabulary Card Component</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <VocabularyCard
            word="Сәлем"
            pronunciation="/sɑːˈlem/"
            translation="Hello"
            example="Сәлем, қалайсың?"
            saved={false}
          />
          
          <VocabularyCard
            word="Рахмет"
            pronunciation="/rɑχˈmet/"
            translation="Thank you"
            example="Рахмет көмегің үшін"
            saved={true}
          />
          
          <VocabularyCard
            word="Қалайсың?"
            pronunciation="/qɑˈlɑjsɯŋ/"
            translation="How are you?"
            saved={false}
          />
        </div>
      </section>
      
      {/* Icons */}
      <section className="mb-16">
        <h2 className="mb-6">Icon Usage</h2>
        <Card>
          <p className="text-muted-foreground mb-4">Using lucide-react icon library</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            {[Play, BookOpen, Target, Award].map((Icon, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
      
      {/* Spacing & Shadows */}
      <section className="mb-16">
        <h2 className="mb-6">Design System Guidelines</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h4 className="mb-3">Border Radius</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-[16px]"></div>
                <span>16px - Small elements</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-[20px]"></div>
                <span>20px - Buttons, inputs</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-[24px]"></div>
                <span>24px - Cards, containers</span>
              </div>
            </div>
          </Card>
          
          <Card>
            <h4 className="mb-3">Shadows</h4>
            <div className="space-y-3">
              <div className="p-4 bg-card shadow-sm border border-border rounded-2xl">
                shadow-sm - Default card shadow
              </div>
              <div className="p-4 bg-card shadow-md border border-border rounded-2xl">
                shadow-md - Hover state
              </div>
              <div className="p-4 bg-card shadow-lg border border-border rounded-2xl">
                shadow-lg - Modal, popup
              </div>
            </div>
          </Card>
        </div>
      </section>
      
      <div className="text-center py-12">
        <Button variant="primary" size="lg" onClick={() => onNavigate('home')}>
          <Play className="w-5 h-5" />
          View Live Platform
        </Button>
      </div>
    </div>
  );
}
