import React, { useState } from 'react';
import { Card } from './Card';
import { Volume2, Star } from 'lucide-react';

interface VocabularyCardProps {
  word: string;
  pronunciation: string;
  translation: string;
  example?: string;
  saved?: boolean;
  onToggleSave?: () => void;
}

export function VocabularyCard({ 
  word, 
  pronunciation, 
  translation, 
  example,
  saved = false,
  onToggleSave 
}: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <Card 
      hover 
      className="cursor-pointer relative overflow-hidden min-h-[200px] flex flex-col justify-center"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave?.();
        }}
        className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
      >
        <Star 
          className={`w-5 h-5 ${saved ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
        />
      </button>
      
      {!isFlipped ? (
        <div className="text-center">
          <div className="mb-4">
            <h2 className="mb-2">{word}</h2>
            <p className="text-muted-foreground italic">{pronunciation}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Play audio functionality
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            Listen
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <p className="text-xl mb-2">{translation}</p>
            {example && (
              <p className="text-sm text-muted-foreground italic mt-4 px-4">
                "{example}"
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="text-center mt-6 text-xs text-muted-foreground">
        Click to flip
      </div>
    </Card>
  );
}
