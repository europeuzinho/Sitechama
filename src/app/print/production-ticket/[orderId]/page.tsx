
'use client';

import { Suspense } from 'react';
import { ProductionTicket } from '@/components/production-ticket';

// This is a wrapper component to allow Suspense to work correctly with hooks
// used inside ProductionTicket if any were to be added (like useSearchParams).
function ProductionTicketPage() {
    return <ProductionTicket />;
}


export default function Page() {
    return (
        <Suspense fallback={<div>Carregando ticket...</div>}>
            <ProductionTicketPage />
        </Suspense>
    );
}
