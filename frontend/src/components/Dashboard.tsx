import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';
import { LessonCard } from './ui/LessonCard';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Award, 
  Calendar,
  Clock,
  Flame,
  Star,
  PlayCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const progressData = [
    { day: 'Mon', minutes: 25 },
    { day: 'Tue', minutes: 40 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 45 },
    { day: 'Fri', minutes: 35 },
    { day: 'Sat', minutes: 50 },
    { day: 'Sun', minutes: 38 },
  ];
  
  const stats = [
    { 
      icon: Flame, 
      label: 'Day Streak', 
      value: '12', 
      color: 'text-[#FF6B6B]',
      bgColor: 'bg-[#FF6B6B]/10'
    },
    { 
      icon: Clock, 
      label: 'Total Hours', 
      value: '24.5', 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      icon: CheckCircle, 
      label: 'Lessons Done', 
      value: '28', 
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    { 
      icon: Star, 
      label: 'Words Learned', 
      value: '342', 
      color: 'text-accent-foreground',
      bgColor: 'bg-accent/30'
    },
  ];
  
  const recentLessons = [
    {
      title: 'Greetings & Introductions',
      level: 'A1',
      duration: '8 min',
      thumbnail: 'https://images.unsplash.com/photo-1573496774379-b930dba17d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHRlYWNoZXIlMjBzcGVha2luZ3xlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 65
    },
    {
      title: 'Shopping & Bargaining',
      level: 'A2',
      duration: '13 min',
      thumbnail: 'https://images.unsplash.com/photo-1758873272808-5580ed7deb44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGNvbmZlcmVuY2UlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 35
    },
  ];
  
  const achievements = [
    { icon: '🏆', title: 'First Week', description: 'Completed 7 days in a row', unlocked: true },
    { icon: '📚', title: 'Book Worm', description: 'Completed 25 lessons', unlocked: true },
    { icon: '🌟', title: 'Vocabulary Master', description: 'Learned 500 words', unlocked: false },
    { icon: '🎯', title: 'Perfect Score', description: 'Got 100% on 10 exercises', unlocked: false },
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Welcome back, Learner! 👋</h1>
        <p className="text-xl text-muted-foreground">
          You're making great progress on your Kazakh learning journey
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="text-center">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-semibold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2>Continue Learning</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('catalog')}>
                View All
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {recentLessons.map((lesson, index) => (
                <LessonCard 
                  key={index}
                  {...lesson}
                  onClick={() => onNavigate('lesson')}
                />
              ))}
            </div>
          </div>
          
          {/* Progress Chart */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="mb-1">Weekly Activity</h3>
                <p className="text-sm text-muted-foreground">Your learning time this week</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-primary">38 min</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6D6D6D"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6D6D6D"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '8px 12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="#1C6EFA" 
                    strokeWidth={3}
                    dot={{ fill: '#1C6EFA', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Achievements */}
          <div>
            <h2 className="mb-6">Achievements</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <Card 
                  key={index}
                  className={`${achievement.unlocked ? '' : 'opacity-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="mb-1">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-secondary">
                          <CheckCircle className="w-3 h-3" />
                          Unlocked
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Level */}
          <Card>
            <h3 className="mb-4">Your Progress</h3>
            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#F7F9FB"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#1C6EFA"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.68)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-semibold">68%</div>
                  <div className="text-sm text-muted-foreground">Level A2</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Complete 12 more lessons to reach B1
              </p>
              <Button variant="primary" size="sm" className="w-full" onClick={() => onNavigate('catalog')}>
                <PlayCircle className="w-4 h-4" />
                Continue Learning
              </Button>
            </div>
          </Card>
          
          {/* Daily Goal */}
          <Card>
            <h3 className="mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Daily Goal
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Time Spent Today</span>
                  <span className="font-medium">38 / 45 min</span>
                </div>
                <ProgressBar progress={84} color="primary" />
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Words Reviewed</span>
                  <span className="font-medium">15 / 20</span>
                </div>
                <ProgressBar progress={75} color="secondary" />
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Adjust Goals
              </Button>
            </div>
          </Card>
          
          {/* Vocabulary Progress */}
          <Card>
            <h3 className="mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              Vocabulary
            </h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Words Learned</span>
                <span className="font-medium">342</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Need Practice</span>
                <span className="font-medium text-accent-foreground">23</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mastered</span>
                <span className="font-medium text-secondary">156</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onNavigate('vocabulary')}
            >
              Practice Flashcards
            </Button>
          </Card>
          
          {/* Upcoming Lessons */}
          <Card>
            <h3 className="mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-foreground" />
              Recommended Next
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Numbers & Counting', level: 'A1', time: '10 min' },
                { title: 'Family Members', level: 'A1', time: '12 min' },
                { title: 'At the Restaurant', level: 'A2', time: '15 min' },
              ].map((lesson, index) => (
                <button
                  key={index}
                  onClick={() => onNavigate('lesson')}
                  className="w-full p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm">{lesson.title}</div>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {lesson.level}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{lesson.time}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
