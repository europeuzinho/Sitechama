
"use client";

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  className?: string;
  starClassName?: string;
}

export function StarRating({ 
  rating, 
  totalStars = 5, 
  className, 
  starClassName 
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const partialStarPercentage = Math.round((rating - fullStars) * 100);
  
  const stars = Array.from({ length: totalStars }, (_, i) => {
    if (i < fullStars) {
      return <Star key={`full-${i}`} className={cn("w-5 h-5 text-primary fill-primary", starClassName)} />;
    }
    if (i === fullStars && partialStarPercentage > 0) {
      return (
        <div key="partial" className="relative">
          <Star className={cn("w-5 h-5 text-gray-300", starClassName)} />
          <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${partialStarPercentage}%` }}>
            <Star className={cn("w-5 h-5 text-primary fill-primary", starClassName)} />
          </div>
        </div>
      );
    }
    return <Star key={`empty-${i}`} className={cn("w-5 h-5 text-gray-300", starClassName)} />;
  });

  return (
    <div className={cn("flex items-center", className)}>
      {stars}
    </div>
  );
}
