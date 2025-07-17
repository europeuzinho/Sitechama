

"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useRouter, useParams } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { getRestaurants, Restaurant } from "@/lib/restaurants-data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TableLayout } from "@/components/table-layout";
import { useEmployeeAuth } from "@/hooks/use-employee-auth";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ServiceModePage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const { employee, loading: employeeLoading } = useEmployeeAuth({ 
    restaurantId,
    requiredRole: "Garçom",
  });

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const loadData = useCallback(() => {
    if (typeof window === 'undefined' || !restaurantId) return;
    const allRestaurants = getRestaurants();
    const currentRestaurant = allRestaurants.find(r => r.id === restaurantId);

    if (currentRestaurant) {
        setRestaurant(currentRestaurant);
        const hasServicePlan = currentRestaurant.plan === 'Completo';
        if (!hasServicePlan) {
             toast({
                title: "Acesso Negado",
                description: "Este modo requer o Plano Completo.",
                variant: "destructive"
            });
            router.push(`/admin/dashboard/${restaurantId}`);
            return;
        }
    } else {
        setTimeout(() => notFound(), 0);
        return;
    }
  }, [restaurantId, router, toast]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
    
    const handleDataChange = () => loadData();
    window.addEventListener('restaurantsChanged', handleDataChange);
    window.addEventListener('ordersChanged', handleDataChange);

    return () => {
        window.removeEventListener('restaurantsChanged', handleDataChange);
        window.removeEventListener('ordersChanged', handleDataChange);
    };
  }, [user, loading, router, loadData]);

  const handleRefresh = () => {
    loadData();
    toast({
        title: "Painel Atualizado",
        description: "As informações das mesas e pedidos foram recarregadas.",
    });
  };

  if (loading || employeeLoading || !user || !restaurant || !employee) {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregando modo atendimento...</p></div>;
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Header />
      <main className="flex-1">
         <div className="container mx-auto max-w-7xl py-12 md:py-16">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold">Modo Atendimento</h1>
                    <p className="text-muted-foreground text-lg">
                        Gestão de Mesas e Pedidos para {restaurant.name}
                    </p>
                </div>
                 {employee && (
                    <div className="flex items-center gap-4">
                         <Button variant="outline" size="icon" onClick={handleRefresh} title="Atualizar dados">
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Atualizar</span>
                        </Button>
                        <div className="text-right">
                            <p className="text-sm font-semibold">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">Garçom/Garçonete</p>
                        </div>
                    </div>
                )}
            </div>
            
            <TableLayout restaurant={restaurant} currentUserRole="Garçom" />
            
         </div>
      </main>
      <Footer />
    </div>
  );
}
