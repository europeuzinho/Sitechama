
"use client";

import { notFound, useParams } from 'next/navigation';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RestaurantCard } from "@/components/restaurant-card";
import { getRestaurants, categories, Restaurant } from "@/lib/restaurants-data";
import { useEffect, useState } from 'react';

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as Restaurant['category'];
  const categoryInfo = categories[category];
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    setRestaurants(getRestaurants());
  }, []);
  

  if (!categoryInfo) {
    notFound();
  }

  const filteredRestaurants = restaurants.filter(
    (restaurant) => restaurant.category === category
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto max-w-7xl py-12 md:py-16">
          <div className="mb-12 flex items-center gap-4">
            <categoryInfo.Icon className="h-10 w-10 text-primary" />
            <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold">
                Restaurantes de Culinária {categoryInfo.name}
                </h1>
                <p className="mt-2 text-muted-foreground">
                Explore nossa seleção dos melhores restaurantes da categoria.
                </p>
            </div>
          </div>
          
          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhum restaurante encontrado para esta categoria no momento.</p>
             </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
