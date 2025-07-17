

"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useRouter, useParams } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { getRestaurants, Restaurant } from "@/lib/restaurants-data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RefreshCw } from "lucide-react";
import { CashRegisterManager } from "@/components/cash-register-manager";
import { getActiveSession, CashSession } from "@/lib/cash-session-store";
import { useEmployeeAuth } from "@/hooks/use-employee-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CashierPanel } from "@/components/cashier-panel";

export default function CashierModePage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const { employee, loading: employeeLoading } = useEmployeeAuth({ 
    restaurantId,
    requiredRole: "Caixa",
  });

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);

  const loadData = useCallback(() => {
    if (typeof window === 'undefined' || !restaurantId) return;
    const allRestaurants = getRestaurants();
    const currentRestaurant = allRestaurants.find(r => r.id === restaurantId);

    if (currentRestaurant) {
        setRestaurant(currentRestaurant);
        const hasCashierPlan = currentRestaurant.plan === 'Completo';
        if (!hasCashierPlan) {
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
    
    const session = getActiveSession(restaurantId);
    setActiveSession(session);
  }, [restaurantId, router, toast]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener('cashSessionsChanged', handleDataChange);
    window.addEventListener('ordersChanged', handleDataChange);
    
    const interval = setInterval(loadData, 10000); // Auto-refresh every 10 seconds

    return () => {
        window.removeEventListener('cashSessionsChanged', handleDataChange);
        window.removeEventListener('ordersChanged', handleDataChange);
        clearInterval(interval);
    };
  }, [user, loading, router, loadData]);

  const handleRefresh = () => {
    loadData();
    toast({
        title: "Painel Atualizado",
        description: "As informações do caixa foram recarregadas.",
    });
  };

  if (loading || employeeLoading || !user || !restaurant || !employee) {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregando modo caixa...</p></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Header />
      <main className="flex-1">
         <div className="container mx-auto max-w-7xl py-12 md:py-16">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold">Modo Caixa</h1>
                    <p className="text-muted-foreground text-lg">
                        Gestão de Pagamentos e Caixa para {restaurant.name}
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
                            <p className="text-xs text-muted-foreground">Operador(a) de Caixa</p>
                        </div>
                    </div>
                )}
            </div>
            
            {!activeSession ? (
                <CashRegisterManager restaurant={restaurant} activeSession={null} operatorName={employee.name} />
            ) : (
                 <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <CashierPanel restaurant={restaurant} />
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <CashRegisterManager restaurant={restaurant} activeSession={activeSession} operatorName={employee.name} />
                    </div>
                </div>
            )}
         </div>
      </main>
      <Footer />
    </div>
  );
}
