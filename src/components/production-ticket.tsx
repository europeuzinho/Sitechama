

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Order, OrderItem, getOrderById } from '@/lib/order-store';
import { MenuItem, menuData } from '@/lib/menu-data';
import { Restaurant, getRestaurants } from '@/lib/restaurants-data';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


const MENU_STORAGE_KEY_PREFIX = 'menuData-';

interface ProductionTicketProps {}

export function ProductionTicket({}: ProductionTicketProps) {
    const params = useParams();
    const searchParams = useSearchParams();
    
    const orderId = params.orderId as string;
    const departmentOrPrintGroup = searchParams.get('department'); // Now represents the print group

    const [order, setOrder] = useState<Order | null>(null);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        if (!orderId || !departmentOrPrintGroup) {
            setIsLoading(false);
            return;
        }

        // We need to find the restaurantId first
        const allRestaurants = getRestaurants();
        let foundOrder: Order | null = null;
        let foundRestaurant: Restaurant | null = null;

        for (const res of allRestaurants) {
            const tempOrder = getOrderById(res.id, orderId);
            if (tempOrder) {
                foundOrder = tempOrder;
                foundRestaurant = res;
                break;
            }
        }
        
        setOrder(foundOrder);
        setRestaurant(foundRestaurant);

        if (foundRestaurant) {
            document.title = `Pedido para - ${departmentOrPrintGroup.toUpperCase()}`; // Update page title
            const storageKey = `${MENU_STORAGE_KEY_PREFIX}${foundRestaurant.id}`;
            const storedMenuRaw = localStorage.getItem(storageKey);
            const loadedMenu = storedMenuRaw ? JSON.parse(storedMenuRaw) : (menuData[foundRestaurant.id] || []);
            setMenu(loadedMenu);
        }
        
        setIsLoading(false);
    }, [orderId, departmentOrPrintGroup]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <main className="bg-gray-100 min-h-screen p-4 sm:p-8 flex justify-center">
                <div className="w-full max-w-sm bg-white shadow-lg rounded-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Separator />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </main>
        );
    }
    
    if (!order || !restaurant || !departmentOrPrintGroup) {
        return (
             <main className="bg-gray-100 min-h-screen p-4 sm:p-8 flex justify-center">
                <div className="w-full max-w-sm bg-white shadow-lg rounded-lg p-6 text-center">
                    <p className="text-destructive">Erro: Pedido ou grupo de impressão não encontrado.</p>
                </div>
            </main>
        );
    }

    // Filter only the new items for the specified print group
    const itemsForTicket = order.items.filter(
        item => item.itemStatus === 'Pendente' && item.printGroup === departmentOrPrintGroup
    );

    if (itemsForTicket.length === 0) {
         // Auto-close the window if there's nothing to print
        if (typeof window !== 'undefined') {
            // A small delay allows any console messages to be seen during development
            setTimeout(() => window.close(), 500);
        }
        return (
             <main className="bg-gray-100 min-h-screen p-4 sm:p-8 flex justify-center">
                <div className="w-full max-w-sm bg-white shadow-lg rounded-lg p-6 text-center">
                    <p className="text-muted-foreground">Nenhum item novo para este grupo. Esta janela será fechada.</p>
                </div>
            </main>
        );
    }
    
    return (
        <main className="bg-gray-100 min-h-screen p-4 sm:p-8 flex justify-center">
            <style jsx global>{`
                @media print {
                    body {
                        background-color: #fff;
                    }
                    .no-print {
                        display: none;
                    }
                    main {
                       padding: 0;
                       margin: 0;
                    }
                    .ticket-container {
                       width: 80mm;
                       padding: 2mm;
                       font-size: 10pt;
                       box-shadow: none;
                       border: none;
                    }
                }
            `}</style>
            <div className="ticket-container w-full max-w-sm bg-white shadow-lg rounded-lg p-4 relative font-mono">
                <Button onClick={handlePrint} variant="outline" size="icon" className="absolute top-4 right-4 no-print">
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Imprimir</span>
                </Button>

                <div className="text-center mb-2">
                    <h1 className="text-xl font-bold uppercase">{departmentOrPrintGroup}</h1>
                    <p className="text-xs">{restaurant.name}</p>
                </div>

                <Separator className="my-2 border-dashed" />

                <div className="text-sm space-y-1 mb-2">
                    <div className="flex justify-between">
                        <span>Mesa:</span>
                        <span className="font-semibold text-lg">{order.tableNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Comanda:</span>
                        <span className="font-semibold text-lg">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Data:</span>
                        <span className="font-semibold">{format(new Date(order.createdAt), "dd/MM HH:mm", { locale: ptBR })}</span>
                    </div>
                </div>

                <Separator className="my-2 border-dashed" />

                <div className="space-y-2 mt-3">
                    {itemsForTicket.map((item, index) => {
                         const menuItem = menu.find(m => m.id === item.itemId);
                         return (
                            <div key={item.createdAt + index}>
                                <div className="text-lg font-bold">
                                    <span>{item.quantity}x</span> {menuItem?.name || 'Item não encontrado'}
                                </div>
                                {menuItem?.description && <p className="text-xs text-gray-600 pl-2">Obs: {menuItem.description}</p>}
                            </div>
                         );
                    })}
                </div>
                
                <div className="mt-4 text-center text-xs text-gray-400">
                    <p>Ticket gerado por Chama.</p>
                </div>
            </div>
        </main>
    );
}
