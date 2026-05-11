import React, { useState } from 'react';
import { Card } from './ui/Card';
import { LessonCard } from './ui/LessonCard';
import { SearchInput } from './ui/SearchInput';
import { LevelBadge } from './ui/LevelBadge';
import { Filter, SlidersHorizontal } from 'lucide-react';

interface LessonsCatalogProps {
  onNavigate: (page: string) => void;
}

export function LessonsCatalog({ onNavigate }: LessonsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const levels = ['A1', 'A2', 'B1', 'B2'];
  
  const categories = [
    'All Topics',
    'Everyday Speech',
    'Travel',
    'School & Education',
    'Work & Business',
    'Grammar',
    'Culture',
    'Food & Dining',
  ];
  
  const lessons = [
    {
      title: 'Greetings & Introductions',
      level: 'A1',
      duration: '8 min',
      thumbnail: 'https://images.unsplash.com/photo-1573496774379-b930dba17d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHRlYWNoZXIlMjBzcGVha2luZ3xlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 65,
      category: 'Everyday Speech'
    },
    {
      title: 'Numbers & Counting',
      level: 'A1',
      duration: '10 min',
      thumbnail: 'https://images.unsplash.com/photo-1758270704464-f980b03b9633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMGVkdWNhdGlvbiUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0,
      category: 'Everyday Speech'
    },
    {
      title: 'Family Members',
      level: 'A1',
      duration: '12 min',
      thumbnail: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnQlMjBzdHVkeWluZ3xlbnwxfHx8fDE3NjQ1NTI5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0,
      category: 'Everyday Speech'
    },
    {
      title: 'At the Restaurant',
      level: 'A2',
      duration: '15 min',
      thumbnail: 'https://images.unsplash.com/photo-1758874573138-f3dd1ed25c7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwb25saW5lfGVufDF8fHx8MTc2NDU2OTkwMnww&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0,
      category: 'Food & Dining'
    },
    {
      title: 'Shopping & Bargaining',
      level: 'A2',
      duration: '13 min',
      thumbnail: 'https://images.unsplash.com/photo-1758873272808-5580ed7deb44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGNvbmZlcmVuY2UlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 35,
      category: 'Travel'
    },
    {
      title: 'Asking for Directions',
      level: 'A2',
      duration: '11 min',
      thumbnail: 'https://images.unsplash.com/photo-1573496774379-b930dba17d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHRlYWNoZXIlMjBzcGVha2luZ3xlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0,
      category: 'Travel'
    },
    {
      title: 'Business Meeting Etiquette',
      level: 'B1',
      duration: '18 min',
      thumbnail: 'https://images.unsplash.com/photo-1758270704464-f980b03b9633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMGVkdWNhdGlvbiUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NjQ1OTkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0,
      category: 'Work & Business'
    },
    {
      title: 'Kazakh Traditions',
      level: 'B1',
      duration: '20 min',
      thumbnail: 'https://images.unsplash.com/photo-1763842092319-56e717355ab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGN1bHR1cmUlMjBwYXR0ZXJuc3xlbnwxfHx8fDE3NjQ1OTkyODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0,
      category: 'Culture'
    },
    {
      title: 'Advanced Grammar Patterns',
      level: 'B2',
      duration: '25 min',
      thumbnail: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnQlMjBzdHVkeWluZ3xlbnwxfHx8fDE3NjQ1NTI5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      progress: 0,
      category: 'Grammar'
    },
  ];
  
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !selectedLevel || lesson.level === selectedLevel;
    const matchesCategory = !selectedCategory || selectedCategory === 'All Topics' || lesson.category === selectedCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4">Video Lessons Catalog</h1>
        <p className="text-xl text-muted-foreground">
          Explore {lessons.length}+ video lessons across all levels
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <SearchInput 
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden px-4 py-3 bg-card border border-border rounded-[20px] flex items-center gap-2"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>
        
        {/* Level Filter */}
        <div className="flex flex-wrap gap-3">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
              className={`transition-all ${
                selectedLevel === level ? 'scale-105' : ''
              }`}
            >
              <LevelBadge 
                level={level} 
                size="md"
              />
            </button>
          ))}
          {selectedLevel && (
            <button
              onClick={() => setSelectedLevel(null)}
              className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" />
              <h3>Filters</h3>
            </div>
            
            {/* Categories */}
            <div className="mb-6">
              <h4 className="mb-3 text-sm text-muted-foreground">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === 'All Topics' ? null : category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category || (!selectedCategory && category === 'All Topics')
                        ? 'bg-primary text-white'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Duration */}
            <div className="mb-6">
              <h4 className="mb-3 text-sm text-muted-foreground">Duration</h4>
              <div className="space-y-2">
                {['Under 10 min', '10-15 min', '15-20 min', '20+ min'].map((duration) => (
                  <label key={duration} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{duration}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Progress */}
            <div>
              <h4 className="mb-3 text-sm text-muted-foreground">Progress</h4>
              <div className="space-y-2">
                {['Not Started', 'In Progress', 'Completed'].map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Lessons Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredLessons.length} lessons
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLessons.map((lesson, index) => (
              <LessonCard 
                key={index}
                {...lesson}
                onClick={() => onNavigate('lesson')}
              />
            ))}
          </div>
          
          {filteredLessons.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-muted-foreground">No lessons found matching your filters</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
