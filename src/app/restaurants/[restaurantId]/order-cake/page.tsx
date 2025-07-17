
'use client';

import { useState, useEffect, Suspense } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getRestaurants, Restaurant } from '@/lib/restaurants-data';
import { getReservations, Reservation, updateReservation } from '@/lib/reservation-store';
import { Cake, Check, Copy, CreditCard, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { notifyCakeOrder } from '@/ai/flows/notify-cake-order-flow';
import QRCode from 'qrcode.react';

function OrderCakeContent() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const { toast } = useToast();

    const restaurantId = params.restaurantId as string;
    const [restaurant, setRestaurant] = useState<Restaurant | undefined>();
    const [userReservations, setUserReservations] = useState<Reservation[]>([]);
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
    const [step, setStep] = useState<'select' | 'payment' | 'confirming' | 'confirmed'>('select');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const allRestaurants = getRestaurants();
        const currentRestaurant = allRestaurants.find(r => r.id === restaurantId);
        if (!currentRestaurant || !currentRestaurant.cakeOrderSettings.enabled) {
            notFound();
            return;
        }
        setRestaurant(currentRestaurant);

        if (user?.email) {
            const allReservations = getReservations().filter(r => r.restaurantId === restaurantId);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const futureReservations = allReservations.filter(r => {
                const reservationDate = parseISO(r.date);
                return r.userEmail === user.email &&
                       reservationDate >= today &&
                       r.status === 'Confirmado';
            }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            setUserReservations(futureReservations);
        }
    }, [restaurantId, user, loading]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    const handleProceedToPayment = () => {
        if (!selectedReservationId) {
            toast({ title: 'Selecione uma reserva', description: 'Você precisa escolher uma reserva para associar ao bolo.', variant: 'destructive' });
            return;
        }
        setStep('payment');
    }
    
    const handleCopyPixKey = () => {
        if(!restaurant) return;
        navigator.clipboard.writeText(restaurant.cakeOrderSettings.pixKey);
        toast({ title: 'Chave Pix Copiada!', description: 'Use o código no seu aplicativo do banco.'});
    }

    const handleConfirmPayment = async () => {
        if (!selectedReservationId || !restaurant || !user?.email) return;

        setStep('confirming');
        setIsSubmitting(true);
        const reservation = userReservations.find(r => r.id === selectedReservationId);
        if (!reservation) {
            toast({ title: "Reserva não encontrada", variant: "destructive" });
            setIsSubmitting(false);
            setStep('payment');
            return;
        }

        try {
            // 1. Update reservation with cake info
            const updatedReservation: Reservation = {
                ...reservation,
                observations: reservation.observations
                    ? `${reservation.observations}\n\nObservação Automática: ${restaurant.cakeOrderSettings.name} (Pago via Pix).`
                    : `${restaurant.cakeOrderSettings.name} (Pago via Pix).`,
                hasCakeOrder: true,
            };
            updateReservation(updatedReservation);

            // 2. Trigger AI notification flow
            await notifyCakeOrder({
                restaurantName: restaurant.name,
                restaurantAddress: restaurant.address,
                managerEmail: restaurant.ownerEmail,
                bakeryEmail: 'pricethegames@gmail.com',
                reservationDate: format(parseISO(reservation.date), "dd/MM/yyyy"),
                reservationTime: reservation.time,
                reservationName: reservation.fullName,
            });
            
            // 3. Update UI
            setStep('confirmed');

        } catch (error) {
            console.error("Failed to confirm payment and notify:", error);
            toast({ title: "Erro na Confirmação", description: "Não foi possível processar a encomenda. Tente novamente.", variant: "destructive" });
            setStep('payment');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading || !user || !restaurant) {
        return <div className="flex min-h-screen items-center justify-center"><p>Carregando...</p></div>;
    }

    const selectedReservation = userReservations.find(r => r.id === selectedReservationId);
    const { cakeOrderSettings } = restaurant;

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-secondary/50">
                <div className="container mx-auto max-w-3xl py-12 md:py-16">
                    <Card>
                        <CardHeader className="text-center">
                             <Cake className="mx-auto h-12 w-12 text-primary mb-4" />
                            <CardTitle className="font-headline text-4xl md:text-5xl font-bold">Encomenda de Bolo</CardTitle>
                            <CardDescription className="text-lg">Celebre em grande estilo em {restaurant.name}</CardDescription>
                        </CardHeader>
                        
                        {step === 'select' && (
                             <CardContent>
                                <h3 className="text-xl font-semibold mb-2">1. Selecione sua Reserva</h3>
                                <p className="text-muted-foreground mb-4">O bolo será preparado para a data e hora da reserva selecionada.</p>
                                {userReservations.length > 0 ? (
                                    <RadioGroup value={selectedReservationId || ''} onValueChange={setSelectedReservationId}>
                                        <div className="space-y-2">
                                            {userReservations.map(res => (
                                                 <Label key={res.id} htmlFor={res.id} className="flex items-center gap-4 border p-4 rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                                                     <RadioGroupItem value={res.id} id={res.id} />
                                                     <div>
                                                         <p className="font-bold">{format(parseISO(res.date), "PPP", { locale: ptBR })} às {res.time}</p>
                                                         <p className="text-sm text-muted-foreground">Reserva para {res.numberOfPeople} pessoa(s) em nome de {res.fullName}</p>
                                                     </div>
                                                 </Label>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        <p>Você não possui reservas futuras e confirmadas neste restaurante.</p>
                                        <Button variant="link" asChild><Link href={`/reservations?restaurantId=${restaurant.id}`}>Faça uma reserva primeiro</Link></Button>
                                    </div>
                                )}
                            </CardContent>
                        )}

                        {step === 'payment' && selectedReservation && (
                            <CardContent>
                                <h3 className="text-xl font-semibold mb-2">2. Efetue o Pagamento</h3>
                                <p className="text-muted-foreground mb-4">Para confirmar sua encomenda, realize o pagamento via Pix.</p>
                                 <div className="p-6 border rounded-lg bg-background">
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="text-center">
                                            <div className="p-2 border bg-white rounded-lg inline-block">
                                                 <QRCode id="pix-qrcode" value={cakeOrderSettings.pixKey} size={180} />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">Leia o QR Code com seu app</p>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <h4 className="font-bold text-lg">Detalhes do Pagamento</h4>
                                            <Separator className="my-3"/>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between"><span>Produto:</span><span className="font-medium">{cakeOrderSettings.name}</span></div>
                                                <div className="flex justify-between"><span>Valor:</span><span className="font-medium">{cakeOrderSettings.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                                                <div className="flex justify-between"><span>Para Reserva:</span><span className="font-medium">{format(parseISO(selectedReservation.date), "dd/MM/yy")} às {selectedReservation.time}</span></div>
                                            </div>
                                             <Separator className="my-3"/>
                                             <Label htmlFor="pix-key" className="text-xs">Ou use o Pix Copia e Cola:</Label>
                                             <div className="flex items-center gap-2 mt-1">
                                                 <input id="pix-key" readOnly value={cakeOrderSettings.pixKey} className="truncate text-xs p-2 border rounded-md bg-muted flex-1 font-mono"/>
                                                 <Button variant="outline" size="icon" onClick={handleCopyPixKey}><Copy className="h-4 w-4"/></Button>
                                             </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                        
                        {(step === 'confirming' || step === 'confirmed') && (
                             <CardContent className="text-center py-12">
                                {step === 'confirming' && <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />}
                                {step === 'confirmed' && <Check className="h-16 w-16 text-green-500 bg-green-100 rounded-full p-2 mx-auto" />}
                                
                                <h3 className="text-2xl font-bold mt-6">
                                    {step === 'confirming' && 'Confirmando Pagamento...'}
                                    {step === 'confirmed' && 'Encomenda Confirmada!'}
                                </h3>
                                <p className="text-muted-foreground mt-2 max-w-prose mx-auto">
                                     {step === 'confirming' && 'Aguarde um momento enquanto atualizamos sua reserva e notificamos a equipe.'}
                                     {step === 'confirmed' && 'Tudo certo! Seu bolo estará esperando por você. Uma observação foi adicionada à sua reserva e a equipe do restaurante foi notificada.'}
                                </p>
                            </CardContent>
                        )}

                        <CardFooter className="flex justify-end items-center pt-6">
                           {step === 'select' && (
                             <Button onClick={handleProceedToPayment} disabled={!selectedReservationId}>
                                <CreditCard className="mr-2"/> Ir para Pagamento
                            </Button>
                           )}
                           {step === 'payment' && (
                            <div className="flex justify-between w-full">
                                <Button variant="ghost" onClick={() => setStep('select')} disabled={isSubmitting}>
                                    Voltar
                                </Button>
                                <Button onClick={handleConfirmPayment} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? "Confirmando..." : "Já Paguei, Confirmar Encomenda"}
                                </Button>
                            </div>
                           )}
                           {step === 'confirmed' && (
                             <Button asChild>
                                <Link href="/profile">Ver Minhas Reservas</Link>
                            </Button>
                           )}
                           {step === 'confirming' && <div />}
                        </CardFooter>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function OrderCakePage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <OrderCakeContent />
        </Suspense>
    );
}
