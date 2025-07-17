
'use client';

import { useState, useEffect } from 'react';
import { notFound, redirect, useParams } from 'next/navigation';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getRestaurants, Restaurant } from "@/lib/restaurants-data";
import { menuData, MenuItem } from "@/lib/menu-data";
import { Utensils, Sparkles, Star, Leaf, WheatOff, GlassWater, Beef, Dessert, Salad } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

const tagComponents: Record<string, { icon: React.ElementType, className: string }> = {
  'Novo': { icon: Sparkles, className: "bg-blue-100 text-blue-800 border-blue-200" },
  'Mais Pedido': { icon: Star, className: "bg-amber-100 text-amber-800 border-amber-200" },
  'Vegetariano': { icon: Leaf, className: "bg-green-100 text-green-800 border-green-200" },
  'Sem Glúten': { icon: WheatOff, className: "bg-orange-100 text-orange-800 border-orange-200" },
};

const categoryIcons: Record<MenuItem['category'], React.ElementType> = {
  'Entradas': Salad,
  'Pratos Principais': Beef,
  'Sobremesas': Dessert,
  'Bebidas': GlassWater,
};

function MenuTag({ tag }: { tag: keyof typeof tagComponents }) {
  const TagInfo = tagComponents[tag];
  if (!TagInfo) return null;
  const { icon: Icon, className } = TagInfo;

  return (
    <Badge variant="outline" className={cn("text-xs font-medium gap-1.5", className)}>
      <Icon className="h-3 w-3" />
      {tag}
    </Badge>
  );
}

const MenuCategory = ({ items }: { items: MenuItem[] }) => (
    <div className="space-y-6">
        {items.length > 0 ? (
            items.map((item, index) => (
                <div key={item.id}>
                    <div className="flex items-start gap-6">
                        <img
                            src={item.image || 'https://placehold.co/120x120.png'}
                            alt={`Foto do prato ${item.name}`}
                            width={120}
                            height={120}
                            className="rounded-lg object-cover aspect-square"
                            data-ai-hint="food dish"
                        />
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold">{item.name}</h4>
                            {item.tags && (
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    {item.tags.map(tag => <MenuTag key={tag} tag={tag as keyof typeof tagComponents} />)}
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                                {item.description}
                            </p>
                        </div>
                        <div className="text-lg font-bold text-right shrink-0">
                            {item.price}
                        </div>
                    </div>
                    {index < items.length - 1 && <Separator className="mt-6" />}
                </div>
            ))
        ) : (
            <div className="text-center text-muted-foreground py-8">
                Nenhum item encontrado nesta categoria.
            </div>
        )}
    </div>
);


const MENU_STORAGE_KEY_PREFIX = 'menuData-';

export default function MenuPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>();
  const [currentMenuData, setCurrentMenuData] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadMenu = () => {
    if (!restaurantId) return;
    const storageKey = `${MENU_STORAGE_KEY_PREFIX}${restaurantId}`;
    const storedMenu = localStorage.getItem(storageKey);
    let menuToLoad : MenuItem[] = [];
    if (storedMenu) {
        menuToLoad = JSON.parse(storedMenu);
    } else {
        menuToLoad = menuData[restaurantId] || [];
    }
    // Filter for visible items before setting state
    setCurrentMenuData(menuToLoad.filter(item => item.isVisible !== false));
    setIsLoading(false);
  };

  useEffect(() => {
    const allRestaurants = getRestaurants();
    const currentRestaurant = allRestaurants.find(r => r.id === restaurantId);
    
    if (currentRestaurant) {
        setRestaurant(currentRestaurant);
        const hasLiveMenuPlan = currentRestaurant.plan === 'Digital' || currentRestaurant.plan === 'Completo';
        if (!hasLiveMenuPlan) {
            redirect(`/restaurants/${currentRestaurant.id}`);
        }
    } else {
        notFound();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurant) {
      loadMenu();
      const handleMenuChange = () => loadMenu();
      window.addEventListener('menuChanged', handleMenuChange);

      return () => {
          window.removeEventListener('menuChanged', handleMenuChange);
      };
    }
  }, [restaurant]);


  if (isLoading || !restaurant) {
     return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-secondary/50 flex items-center justify-center">
                <p>Carregando cardápio...</p>
            </main>
            <Footer />
        </div>
     );
  }
  
  const menuCategories = Array.from(new Set(currentMenuData.map(item => item.category)));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto max-w-4xl py-12 md:py-16">
           <div className="text-center mb-12">
            <Utensils className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
              Cardápio de {restaurant.name}
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Conheça nossas especialidades.
            </p>
          </div>
          
          {currentMenuData.length > 0 && menuCategories.length > 0 ? (
              <Tabs defaultValue={menuCategories.includes('Entradas') ? 'Entradas' : menuCategories[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
                  {menuCategories.map(category => {
                    const Icon = categoryIcons[category];
                    return (
                        <TabsTrigger key={category} value={category} className="gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            {category}
                        </TabsTrigger>
                    );
                  })}
                </TabsList>
                {menuCategories.map(category => (
                    <TabsContent key={category} value={category}>
                        <Card>
                            <CardContent className="pt-6">
                                <MenuCategory items={currentMenuData.filter(item => item.category === category)} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
          ) : (
             <Card>
                <CardContent>
                    <div className="text-center text-muted-foreground py-16">
                        O cardápio deste restaurante ainda não foi cadastrado ou nenhum item está visível.
                    </div>
                </CardContent>
             </Card>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
