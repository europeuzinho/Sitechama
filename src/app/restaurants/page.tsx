

"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RestaurantCard } from "@/components/restaurant-card";
import { getRestaurants, Restaurant, categories } from "@/lib/restaurants-data";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';


function RestaurantsPageContent() {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('search') || '';

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('popular');

  useEffect(() => {
    setRestaurants(getRestaurants());
  }, []);

  const filteredAndSortedRestaurants = useMemo(() => {
    let filtered = restaurants;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(lowercasedQuery) ||
            r.location.toLowerCase().includes(lowercasedQuery) ||
            categories[r.category].name.toLowerCase().includes(lowercasedQuery)
        );
    }

    if (selectedCategory !== 'all') {
        filtered = filtered.filter(r => r.category === selectedCategory);
    }
    
    // Sort logic
    if (sortOrder === 'rating') {
        filtered.sort((a, b) => {
            const ratingA = a.reviews.length > 0 ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0;
            const ratingB = b.reviews.length > 0 ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0;
            return ratingB - ratingA;
        });
    } else if (sortOrder === 'name') {
        filtered.sort((a,b) => a.name.localeCompare(b.name));
    }
    // 'popular' is default and doesn't require specific sorting here as it's based on initial data order.

    return filtered;
  }, [restaurants, searchQuery, selectedCategory, sortOrder]);


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto max-w-7xl py-12 md:py-16">
          <div className="mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
              Todos os Restaurantes
            </h1>
            <p className="mt-2 text-muted-foreground">
              Explore nossa seleção completa de restaurantes parceiros.
            </p>
          </div>

          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="text" 
                    placeholder="Busque por nome ou local..." 
                    className="w-full pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px] h-12">
                    <SelectValue placeholder="Filtrar por Categoria" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {Object.entries(categories).map(([key, {name}]) => (
                        <SelectItem key={key} value={key}>{name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full md:w-[180px] h-12">
                    <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="popular">Populares</SelectItem>
                    <SelectItem value="rating">Melhor Avaliados</SelectItem>
                    <SelectItem value="name">Ordem Alfabética</SelectItem>
                </SelectContent>
            </Select>
          </div>
          
          {filteredAndSortedRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
                <p>Nenhum restaurante encontrado com os filtros aplicados.</p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}


export default function RestaurantsPage() {
    return (
        <Suspense fallback={<div>Carregando filtros...</div>}>
            <RestaurantsPageContent />
        </Suspense>
    );
}
