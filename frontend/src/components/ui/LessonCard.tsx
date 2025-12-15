import React from 'react';
import { Card } from './Card';
import { LevelBadge } from './LevelBadge';
import { Button } from './Button';
import { Clock, Play } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface LessonCardProps {
  title: string;
  level: string;
  duration: string;
  thumbnail: string;
  progress?: number;
  onClick?: () => void;
}

export function LessonCard({ 
  title, 
  level, 
  duration, 
  thumbnail, 
  progress = 0,
  onClick 
}: LessonCardProps) {
  return (
    <Card hover className="overflow-hidden p-0 cursor-pointer" onClick={onClick}>
      <div className="relative aspect-video bg-muted overflow-hidden">
        <ImageWithFallback 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-200 flex items-center justify-center group">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Play className="w-8 h-8 text-primary ml-1" />
          </div>
        </div>
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="flex-1">{title}</h3>
          <LevelBadge level={level} size="sm" />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>
        <Button variant="primary" size="sm" className="w-full">
          {progress > 0 ? 'Continue' : 'Start Lesson'}
        </Button>
      </div>
    </Card>
  );
}
