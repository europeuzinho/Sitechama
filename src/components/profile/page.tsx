

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { Reservation, getReservations, deleteReservation } from "@/lib/reservation-store";
import { getRestaurants, Restaurant } from "@/lib/restaurants-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Utensils, Trash2, Trophy, Ticket } from "lucide-react";
import { getUserPoints, addUserPoints } from "@/lib/points-store";
import { redeemCode } from "@/lib/redemption-codes-store";


export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [points, setPoints] = useState(0);
  const [redemptionCodeInput, setRedemptionCodeInput] = useState('');

  const loadData = () => {
    if (user && user.email) {
        setReservations(getReservations().filter(r => r.userEmail === user.email));
        setRestaurants(getRestaurants());
        setPoints(getUserPoints(user.email));
    }
  }

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
    } else {
        loadData();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
        window.addEventListener('reservationsChanged', loadData);
        window.addEventListener('reviewsChanged', loadData);
        window.addEventListener('pointsChanged', loadData);
        return () => {
          window.removeEventListener('reservationsChanged', loadData);
          window.removeEventListener('reviewsChanged', loadData);
          window.removeEventListener('pointsChanged', loadData);
        };
    }
  }, [user]);

  const handleDelete = (restaurantId: string, id: string) => {
    deleteReservation(restaurantId, id);
    toast({
      title: "Reserva Cancelada",
      description: "Sua reserva foi cancelada com sucesso.",
    });
  };
  
  const handleRedeemCode = () => {
    if (!user || !user.email) return;

    const result = redeemCode(redemptionCodeInput, user.email);

    if (result.success) {
      addUserPoints(user.email, 5, `Código resgatado: ${redemptionCodeInput}`);
      toast({
        title: "Código Resgatado!",
        description: "Você ganhou 5 pontos. Obrigado por sua visita!",
      });
    } else {
      toast({
        title: "Erro no Resgate",
        description: result.message,
        variant: "destructive",
      });
    }
    setRedemptionCodeInput('');
  };

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : "Restaurante não encontrado";
  };


  if (loading || !user) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <div className="text-center pt-4">
                    <p>Carregando seu perfil...</p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto max-w-4xl py-12 md:py-16">
            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName || 'Usuário'} />
                                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="text-center md:text-left">
                                <h1 className="font-headline text-3xl font-bold">{user.displayName}</h1>
                                <p className="text-muted-foreground">{user.email}</p>
                                <Button variant="link" className="p-0 h-auto mt-2 text-destructive" onClick={logout}>Sair da conta</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <Trophy className="h-8 w-8 text-amber-500" />
                            <div>
                                <CardTitle className="text-2xl font-bold">{points} Pontos</CardTitle>
                                <CardDescription>Seu saldo de fidelidade</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <p className="text-xs text-muted-foreground">Ganhe 1 ponto por reserva, 5 por código e 5 por avaliação.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <Ticket className="w-6 h-6 text-primary"/>
                            Resgatar Código
                        </CardTitle>
                        <CardDescription>Insira o código da sua nota fiscal para ganhar 5 pontos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input 
                                type="text" 
                                placeholder="CÓDIGO-DA-NOTA"
                                value={redemptionCodeInput}
                                onChange={(e) => setRedemptionCodeInput(e.target.value.toUpperCase())}
                            />
                            <Button type="button" onClick={handleRedeemCode} disabled={!redemptionCodeInput}>Resgatar</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>


            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Minhas Reservas</CardTitle>
                        <CardDescription>Aqui estão suas reservas futuras e passadas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reservations.length > 0 ? (
                            <ul className="space-y-4">
                                {reservations.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(res => (
                                    <li key={res.id} className="p-4 border rounded-lg flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <p className="font-semibold text-lg hover:underline">
                                                <Link href={`/restaurants/${res.restaurantId}`}>{getRestaurantName(res.restaurantId)}</Link>
                                            </p>
                                            <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{format(new Date(res.date), "dd 'de' MMMM, yyyy", { locale: ptBR })} às {res.time}</span>
                                                <span className="flex items-center gap-1.5"><Utensils className="w-4 h-4"/>{res.numberOfPeople} pessoa(s)</span>
                                            </div>
                                        </div>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Cancelar
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancelar Reserva?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                Esta ação não pode ser desfeita. Você tem certeza que deseja cancelar sua reserva em <span className="font-semibold">{getRestaurantName(res.restaurantId)}</span>?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(res.restaurantId, res.id)}>Confirmar Cancelamento</AlertDialogAction>
                                            </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Você ainda não fez nenhuma reserva.</p>
                                <Button asChild className="mt-4">
                                    <Link href="/restaurants">Explorar Restaurantes</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
