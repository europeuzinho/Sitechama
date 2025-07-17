
"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useRouter, useParams } from 'next/navigation';
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { PlusCircle, List, Menu as MenuIcon, Table as TableIcon } from "lucide-react";

import { getRestaurants, Restaurant, updateRestaurant } from "@/lib/restaurants-data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WaitlistManager } from "@/components/waitlist-manager";
import { ReservationForm } from "@/components/reservation-form";
import { useEmployeeAuth } from "@/hooks/use-employee-auth";
import { ReservationsPanel } from "@/components/reservations-panel";
import { TableLayout } from "@/components/table-layout";


export default function ReceptionPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const router = useRouter();
  const { user, loading } = useAuth();

  const { employee, loading: employeeLoading } = useEmployeeAuth({ 
    restaurantId,
    requiredRole: "Recepção",
  });

  const { toast } = useToast();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);
  const [today] = useState<Date>(new Date());
  const [dataLoaded, setDataLoaded] = useState(false);


  // Load initial data
  const loadData = useCallback(() => {
    if (!restaurantId) return;
    const allRestaurants = getRestaurants();
    const currentRestaurant = allRestaurants.find(r => r.id === restaurantId);
    
    if (currentRestaurant) {
      setRestaurant(currentRestaurant);
      setDataLoaded(true);
    } else {
      notFound();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadData();

    // Set up event listeners for real-time updates
    const handleDataChange = () => loadData();
    window.addEventListener('reservationsChanged', handleDataChange);
    window.addEventListener('restaurantsChanged', handleDataChange);
    window.addEventListener('waitlistChanged', handleDataChange);
    return () => {
      window.removeEventListener('reservationsChanged', handleDataChange);
      window.removeEventListener('restaurantsChanged', handleDataChange);
      window.removeEventListener('waitlistChanged', handleDataChange);
    };

  }, [user, loading, loadData]);
  

  if (loading || employeeLoading || !user || !restaurant || !dataLoaded || !employee) {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregando painel de recepção...</p></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Header />
      <main className="flex-1">
         <div className="container mx-auto max-w-7xl py-12 md:py-16">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-headline text-4xl font-bold">Modo Recepção</h1>
                    <p className="text-muted-foreground text-lg">
                        Gestão de Clientes para {restaurant.name} - {format(today, "PPP", { locale: ptBR })}
                    </p>
                </div>
                 {employee && (
                    <div className="text-right">
                        <p className="text-sm font-semibold">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">Recepcionista</p>
                    </div>
                )}
                <Dialog open={isReservationFormOpen} onOpenChange={setIsReservationFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nova Reserva
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">Nova Reserva</DialogTitle>
                        </DialogHeader>
                        <div className="pt-4">
                        <ReservationForm 
                            selectedDate={today} 
                            restaurantId={restaurantId}
                            onSuccess={() => setIsReservationFormOpen(false)}
                            successTitle="Reserva Adicionada"
                            successDescription="A reserva do cliente foi registrada com sucesso."
                        />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Tabs defaultValue="tables" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="tables"><TableIcon className="mr-2"/>Visão de Mesas</TabsTrigger>
                    <TabsTrigger value="reservations"><List className="mr-2"/>Reservas do Dia</TabsTrigger>
                    <TabsTrigger value="waitlist"><MenuIcon className="mr-2"/>Fila de Espera</TabsTrigger>
                </TabsList>

                <TabsContent value="tables" className="mt-4">
                    <TableLayout restaurant={restaurant} currentUserRole="Recepção" />
                </TabsContent>
                
                <TabsContent value="reservations" className="mt-4">
                   <ReservationsPanel restaurantId={restaurantId} />
                </TabsContent>

                <TabsContent value="waitlist" className="mt-4">
                   <WaitlistManager restaurantId={restaurantId} />
                </TabsContent>
            </Tabs>
         </div>
      </main>
      <Footer />
    </div>
  );
}
