
"use client";

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RestaurantForm } from '@/components/restaurant-form';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function capitalizeFirstLetter(string: string | null): string {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    const planFromUrl = searchParams.get('plan');
    const plan = capitalizeFirstLetter(planFromUrl);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    const handleFormSubmit = () => {
        // After restaurant is created, redirect to the admin dashboard
        router.push('/admin/dashboard');
    }

    if (loading || !user) {
        return (
             <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-lg space-y-4">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        );
    }
    
    // Create a temporary restaurant object to pass to the form
    // The ownerEmail and plan will be pre-filled and locked.
    const initialRestaurantData = {
        ownerEmail: user.email || '',
        plan: plan as 'Insights' | 'Digital' | 'Completo' | undefined,
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Bem-vindo(a) ao Chama!</CardTitle>
                    <CardDescription>
                        Falta pouco para começar. Preencha os dados principais do seu restaurante.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[70vh] overflow-y-auto pr-4">
                        <RestaurantForm 
                            onFormSubmit={handleFormSubmit}
                            restaurant={initialRestaurantData}
                        />
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <OnboardingContent />
        </Suspense>
    )
}
