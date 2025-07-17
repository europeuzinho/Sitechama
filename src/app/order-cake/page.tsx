

'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function RedirectToRestaurantOrder() {
    const router = useRouter();

    useEffect(() => {
        // This page is deprecated. If a user somehow lands here,
        // we redirect them to the home page or a general restaurants page,
        // as we don't know which restaurant they intended.
        router.replace('/restaurants');
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Redirecionando...</p>
        </div>
    );
}

export default function DeprecatedOrderCakePage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <RedirectToRestaurantOrder />
        </Suspense>
    );
}
