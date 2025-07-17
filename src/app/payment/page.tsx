
"use client";

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

const planDetails = {
    insights: { name: 'Insights', price: 'R$ 99' },
    digital: { name: 'Digital', price: 'R$ 189' },
    completo: { name: 'Completo', price: 'R$ 299' },
};

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    
    const planId = searchParams.get('plan') as keyof typeof planDetails | null;
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'confirmed'>('pending');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
         if (!planId) {
            router.push('/plans');
        }
    }, [user, loading, router, planId]);
    
    const handleConfirmPayment = () => {
        setPaymentStatus('processing');
        // Simulate a payment processing delay
        setTimeout(() => {
            setPaymentStatus('confirmed');
            setTimeout(() => {
                // Redirect to onboarding page with the plan
                router.push(`/onboarding?plan=${planId}`);
            }, 1500);
        }, 2000);
    };
    
    if (loading || !user || !planId) {
        return (
            <main className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </main>
        );
    }
    
    const selectedPlan = planDetails[planId];

    return (
        <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                     {paymentStatus === 'confirmed' ? (
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                     ) : (
                        <CreditCard className="mx-auto h-12 w-12 text-primary" />
                     )}
                    <CardTitle className="font-headline text-3xl">
                        {paymentStatus === 'confirmed' ? 'Pagamento Aprovado!' : 'Finalizar Pagamento'}
                    </CardTitle>
                    <CardDescription>
                         {paymentStatus === 'processing' && 'Processando seu pagamento, aguarde...'}
                         {paymentStatus === 'confirmed' && 'Tudo certo! Estamos preparando seu ambiente.'}
                         {paymentStatus === 'pending' && `Você está assinando o Plano ${selectedPlan.name}.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {paymentStatus !== 'pending' ? (
                        <div className="flex justify-center items-center h-24">
                           <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline p-4 border rounded-lg">
                                <span className="text-muted-foreground">Plano</span>
                                <span className="font-bold text-lg">{selectedPlan.name}</span>
                            </div>
                            <div className="flex justify-between items-baseline p-4 border rounded-lg">
                                <span className="text-muted-foreground">Valor Mensal</span>
                                <span className="font-bold text-lg">{selectedPlan.price}</span>
                            </div>
                            <p className="text-xs text-center text-muted-foreground pt-2">
                                Esta é uma simulação. Clique abaixo para prosseguir com o cadastro do seu restaurante.
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                   {paymentStatus === 'pending' && (
                        <>
                            <Button className="w-full" onClick={handleConfirmPayment}>
                                Confirmar Pagamento
                            </Button>
                            <Button variant="link" asChild>
                                <Link href="/plans">Trocar plano</Link>
                            </Button>
                        </>
                   )}
                </CardFooter>
            </Card>
        </main>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
