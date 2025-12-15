import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { LessonCard } from './ui/LessonCard';
import { LevelBadge } from './ui/LevelBadge';
import { Play, BookOpen, Target, TrendingUp, Headphones, FileText, BarChart3, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const levels = [
    { level: 'A1', title: 'Beginner', description: 'Start your Kazakh journey', icon: BookOpen, lessons: 45 },
    { level: 'A2', title: 'Elementary', description: 'Build your foundation', icon: Target, lessons: 52 },
    { level: 'B1', title: 'Intermediate', description: 'Expand your skills', icon: TrendingUp, lessons: 48 },
    { level: 'B2', title: 'Upper Intermediate', description: 'Master the language', icon: Award, lessons: 38 },
  ];
  
  const features = [
    {
      icon: Play,
      title: 'Video Lessons',
      description: 'Learn from native speakers through engaging video content'
    },
    {
      icon: Headphones,
      title: 'Interactive Subtitles',
      description: 'Click any word in subtitles to see instant translations'
    },
    {
      icon: FileText,
      title: 'Vocabulary Cards',
      description: 'Build your word bank with smart flashcards and practice'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics'
    },
  ];
  
  const featuredLessons = [
    {
      title: 'Greetings & Introductions',
      level: 'A1',
      duration: '8 min',
      thumbnail: 'https://images.unsplash.com/photo-1573496774379-b930dba17d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHRlYWNoZXIlMjBzcGVha2luZ3xlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0
    },
    {
      title: 'Daily Conversations',
      level: 'A2',
      duration: '12 min',
      thumbnail: 'https://images.unsplash.com/photo-1758270704464-f980b03b9633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMGVkdWNhdGlvbiUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0
    },
    {
      title: 'Business Kazakh',
      level: 'B1',
      duration: '15 min',
      thumbnail: 'https://images.unsplash.com/photo-1758873272808-5580ed7deb44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGNvbmZlcmVuY2UlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0
    },
  ];
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-accent/20 rounded-full mb-6">
                <span className="text-sm">🇰🇿 Learn the National Language</span>
              </div>
              <h1 className="text-5xl lg:text-6xl mb-6">
                Learn Kazakh the Smart Way — Through Real Video Lessons
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Short videos, native speakers, interactive practice and progress tracking. Master Kazakh at your own pace.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg" onClick={() => onNavigate('catalog')}>
                  Start Learning
                </Button>
                <Button variant="outline" size="lg" onClick={() => onNavigate('catalog')}>
                  Choose Level
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-8 text-sm">
                <div>
                  <div className="text-2xl font-semibold text-primary">183+</div>
                  <div className="text-muted-foreground">Video Lessons</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-secondary">2,500+</div>
                  <div className="text-muted-foreground">Vocabulary Words</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-accent-foreground">4</div>
                  <div className="text-muted-foreground">Skill Levels</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1758874573138-f3dd1ed25c7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwb25saW5lfGVufDF8fHx8MTc2NDU2OTkwMnww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Students learning online"
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple 4-step process to master Kazakh language
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Watch Video', description: 'Learn from native speakers', icon: Play },
            { step: '02', title: 'Learn Words', description: 'Click subtitles for translations', icon: BookOpen },
            { step: '03', title: 'Practice', description: 'Take interactive exercises', icon: Target },
            { step: '04', title: 'Track Progress', description: 'Monitor your improvement', icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-semibold text-primary mb-2">{item.step}</div>
                <h3 className="mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* Levels */}
      <section className="bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Choose Your Level</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From complete beginner to advanced speaker
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.level} hover className="text-center cursor-pointer" onClick={() => onNavigate('catalog')}>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <LevelBadge level={item.level} size="md" />
                  <h3 className="mt-3 mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-3">{item.description}</p>
                  <div className="text-sm text-primary font-medium">{item.lessons} lessons</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Featured Lessons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="mb-4">Featured Video Lessons</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with these popular lessons
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredLessons.map((lesson, index) => (
            <LessonCard 
              key={index}
              {...lesson}
              onClick={() => onNavigate('lesson')}
            />
          ))}
        </div>
      </section>
      
      {/* Features */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Everything You Need to Learn Kazakh</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for effective language learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} hover>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="text-center bg-gradient-to-br from-primary to-secondary text-white border-0 p-12">
          <h2 className="text-white mb-4">Ready to Start Your Kazakh Journey?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of learners mastering Kazakh through video lessons
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              variant="accent" 
              size="lg"
              onClick={() => onNavigate('catalog')}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              View Pricing
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
