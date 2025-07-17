
"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useRouter, useParams } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { getRestaurants, Restaurant } from "@/lib/restaurants-data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductionPanel } from "@/components/production-panel";
import { useEmployeeAuth } from "@/hooks/use-employee-auth";

export default function KdsModePage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const { employee, loading: employeeLoading } = useEmployeeAuth({ 
    restaurantId,
    requiredRole: "Cozinha",
  });
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadData = useCallback(() => {
    if (typeof window === 'undefined') return;
    const allRestaurants = getRestaurants();
    const currentRestaurant = allRestaurants.find(r => r.id === restaurantId);

    if (currentRestaurant) {
        setRestaurant(currentRestaurant);
         const hasKdsPlan = currentRestaurant.plan === 'Completo';
        if (!hasKdsPlan) {
            router.push(`/admin/dashboard/${restaurantId}`);
            return;
        }
    } else {
        setTimeout(() => notFound(), 0);
        return;
    }
    setDataLoaded(true);
  }, [restaurantId, router]);


  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
    
    const interval = setInterval(loadData, 4000); // Auto-refresh every 4 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [user, loading, router, loadData]);

  if (loading || employeeLoading || !user || !restaurant || !dataLoaded || !employee) {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregando modo cozinha...</p></div>;
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Header />
      <main className="flex-1">
         <div className="container mx-auto max-w-7xl py-12 md:py-16">
            <ProductionPanel restaurant={restaurant} />
         </div>
      </main>
      <Footer />
    </div>
  );
}
