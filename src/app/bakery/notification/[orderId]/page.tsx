
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getRestaurants, Restaurant } from '@/lib/restaurants-data';
import { getReservations, Reservation } from '@/lib/reservation-store';
import { notifyCakeOrder } from '@/ai/flows/notify-cake-order-flow';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Building, Calendar, Clock, Inbox, Loader2, ServerCrash, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type PageStatus = 'loading' | 'error' | 'success';

export default function BakeryNotificationPage() {
    const params = useParams();
    const orderId = params.orderId as string; // This is actually the reservationId

    const [status, setStatus] = useState<PageStatus>('loading');
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [notification, setNotification] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            if (!orderId) {
                notFound();
                return;
            }
            
            try {
                // 1. Fetch Reservation and Restaurant Data
                const allReservations = getReservations();
                const currentReservation = allReservations.find(r => r.id === orderId);

                if (!currentReservation) {
                    throw new Error('Reservation not found');
                }
                setReservation(currentReservation);

                const allRestaurants = getRestaurants();
                const currentRestaurant = allRestaurants.find(r => r.id === currentReservation.restaurantId);

                if (!currentRestaurant) {
                    throw new Error('Restaurant not found');
                }
                setRestaurant(currentRestaurant);

                // 2. Generate Notification Content with AI
                const aiResponse = await notifyCakeOrder({
                    restaurantName: currentRestaurant.name,
                    restaurantAddress: currentRestaurant.address,
                    managerEmail: currentRestaurant.ownerEmail,
                    bakeryEmail: 'pricethegames@gmail.com', // This is just for the prompt, not for sending
                    reservationDate: format(parseISO(currentReservation.date), "dd/MM/yyyy"),
                    reservationTime: currentReservation.time,
                    reservationName: currentReservation.fullName,
                });

                setNotification(aiResponse.bakeryNotification);
                setStatus('success');

            } catch (error) {
                console.error("Error fetching notification data:", error);
                setStatus('error');
            }
        };

        fetchData();
    }, [orderId]);


    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline text-3xl">
                        <Inbox className="h-8 w-8 text-primary"/>
                        Caixa de Entrada da Panificadora
                    </CardTitle>
                    <CardDescription>Visualização da notificação de novo pedido de bolo.</CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
                            <p>Carregando notificação...</p>
                        </div>
                    )}
                     {status === 'error' && (
                        <div className="flex flex-col items-center justify-center text-center text-destructive py-16">
                            <ServerCrash className="h-12 w-12 mb-4"/>
                            <p className="font-semibold">Erro ao Carregar Notificação</p>
                            <p className="text-sm">Não foi possível buscar os dados do pedido. Tente novamente mais tarde.</p>
                        </div>
                    )}
                    {status === 'success' && restaurant && reservation && (
                         <div className="border rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-primary">Novo Pedido de Bolo</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Recebido em: {format(new Date(), "'Dia' dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                                <Badge variant="default" className="bg-blue-600">NOVO</Badge>
                            </div>
                             <Separator className="my-4"/>
                             <div className="prose prose-sm max-w-none text-gray-800">
                                <pre className="text-base whitespace-pre-wrap font-sans bg-transparent p-0">
                                    {notification}
                                </pre>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground text-center w-full">Esta é uma página de simulação para fins de demonstração.</p>
                </CardFooter>
            </Card>
        </main>
    );
}

