
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ReservationForm } from "@/components/reservation-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getRestaurants, Restaurant } from "@/lib/restaurants-data";

function ReservationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const { user, loading } = useAuth();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null | undefined>(undefined);

  useEffect(() => {
    if (restaurantId) {
      const allRestaurants = getRestaurants();
      const foundRestaurant = allRestaurants.find(r => r.id === restaurantId);
      setRestaurant(foundRestaurant || null);
    } else {
        setRestaurant(null);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && user && (!restaurantId || restaurant === null)) {
      // If no restaurant is selected, or not found, redirect to the main restaurants page
      router.push("/restaurants");
    }
  }, [loading, user, router, restaurantId, restaurant]);

  if (loading || !user || restaurant === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-2xl py-12 md:py-16">
            <div className="text-center">
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-full mt-4 mx-auto" />
            </div>
            <div className="mt-8">
               <div className="p-6 space-y-8 border rounded-lg">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-12 w-full" />
               </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
      // This case is handled by the redirect effect, but as a fallback:
      return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl py-12 md:py-16">
          <div className="text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Reserve sua Mesa em {restaurant.name}</h1>
            <p className="mt-4 text-muted-foreground">
              Preencha o formulário abaixo para garantir seu lugar.
            </p>
          </div>
          <div className="mt-8">
            <ReservationForm restaurantId={restaurant.id} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ReservationsPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ReservationsPageContent />
        </Suspense>
    )
}
