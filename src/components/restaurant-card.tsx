

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Menu, Star } from 'lucide-react';
import type { Restaurant } from '@/lib/restaurants-data';
import { categories, getRestaurants } from '@/lib/restaurants-data';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { StarRating } from './star-rating';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant: initialRestaurant }: RestaurantCardProps) {
  const [restaurant, setRestaurant] = useState(initialRestaurant);

  useEffect(() => {
    setRestaurant(initialRestaurant);
  }, [initialRestaurant]);

  const hasLiveMenu = restaurant.plan === 'Digital' || restaurant.plan === 'Completo';
  const categoryInfo = categories[restaurant.category];

  const averageRating = restaurant.reviews && restaurant.reviews.length > 0 
    ? restaurant.reviews.reduce((acc, review) => acc + review.rating, 0) / restaurant.reviews.length
    : 0;
  
  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl">
        <Link href={`/restaurants/${restaurant.id}`} className="block overflow-hidden">
          <Image
            src={restaurant.image}
            alt={`Foto do restaurante ${restaurant.name}`}
            width={600}
            height={400}
            className="object-cover aspect-video hover:scale-105 transition-transform duration-300"
            data-ai-hint="restaurant food"
          />
        </Link>
      <CardContent className="pt-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
            <div>
                 <h3 className="font-bold text-lg">
                    <Link href={`/restaurants/${restaurant.id}`} className="hover:underline">{restaurant.name}</Link>
                </h3>
                <p className="text-sm mt-1 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" /> {restaurant.location}
                </p>
            </div>
            {categoryInfo && (
                <Badge variant="outline">{categoryInfo.name}</Badge>
            )}
        </div>
        <div className="flex items-center gap-1 mt-2">
            <StarRating rating={averageRating} starClassName="w-4 h-4" />
            <span className="text-xs text-muted-foreground ml-1">({restaurant.reviews?.length || 0})</span>
        </div>
        <div className="mt-4 flex-grow flex flex-col justify-end gap-2">
            {hasLiveMenu && (
                <Button variant="outline" asChild>
                    <Link href={`/restaurants/${restaurant.id}/menu`}>
                        <Menu className="mr-2 h-4 w-4" />
                        Ver Cardápio
                    </Link>
                </Button>
            )}
            <Button className="w-full" asChild>
                <Link href={`/reservations?restaurantId=${restaurant.id}`}>Reservar</Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
