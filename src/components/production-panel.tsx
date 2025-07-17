

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Order, OrderItem, getActiveOrdersByRestaurant, updateOrderStatusForItems } from '@/lib/order-store';
import { Restaurant } from '@/lib/restaurants-data';
import { MenuItem, menuData } from '@/lib/menu-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, GlassWater, Check, CheckCheck, Truck, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProductionPanelProps {
  restaurant: Restaurant;
}

interface GroupedItem {
    name: string;
    description?: string;
    department: string;
    status: OrderItem['itemStatus'];
    quantity: number;
    comandaId: string;
    tableNumber: string;
    createdAt: string; // The creation time of the first item in the group for sorting
    originalItems: { orderId: string; itemId: string; createdAt: string; }[];
}

const MENU_STORAGE_KEY_PREFIX = 'menuData-';

export function ProductionPanel({ restaurant }: ProductionPanelProps) {
    const { toast } = useToast();
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [allItems, setAllItems] = useState<GroupedItem[]>([]);
    const [isMenuLoaded, setIsMenuLoaded] = useState(false);

    const loadItems = useCallback(() => {
        if (!isMenuLoaded || menu.length === 0) return;

        const activeOrders = getActiveOrdersByRestaurant(restaurant.id);
        const itemGroups: Record<string, GroupedItem> = {}; // Key: comandaId-itemId-status

        for (const order of activeOrders) {
            for (const item of order.items) {
                 if (item.itemStatus === 'Lançamento' || item.itemStatus === 'Cancelado') continue;
                 
                 const menuItem = menu.find(m => m.id === item.itemId);
                 if (!menuItem) {
                    console.warn(`Menu item with ID ${item.itemId} not found for order ${order.id}. Skipping.`);
                    continue;
                 };

                 const groupKey = `${order.tableId}-${item.itemId}-${item.itemStatus}`;

                 if (!itemGroups[groupKey]) {
                     itemGroups[groupKey] = {
                         name: menuItem.name,
                         description: menuItem.description,
                         department: menuItem.department,
                         status: item.itemStatus,
                         quantity: 0,
                         comandaId: order.id, // Using order.id as comandaId for display
                         tableNumber: order.tableNumber,
                         createdAt: item.createdAt, // Use the first item's createdAt for sorting
                         originalItems: [],
                     };
                 }
                 itemGroups[groupKey].quantity += item.quantity;
                 itemGroups[groupKey].originalItems.push({
                     orderId: order.id,
                     itemId: item.itemId,
                     createdAt: item.createdAt,
                 });
                 // Keep the earliest createdAt for sorting
                 if (new Date(item.createdAt) < new Date(itemGroups[groupKey].createdAt)) {
                     itemGroups[groupKey].createdAt = item.createdAt;
                 }
            }
        }
        
        const sortedItems = Object.values(itemGroups).sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
        });

        setAllItems(sortedItems);

    }, [restaurant.id, menu, isMenuLoaded]);


    const loadMenu = useCallback(() => {
        const storageKey = `${MENU_STORAGE_KEY_PREFIX}${restaurant.id}`;
        const storedMenuRaw = localStorage.getItem(storageKey);
        let menuToLoad: MenuItem[] = menuData[restaurant.id] || [];
        if (storedMenuRaw) {
            try {
                menuToLoad = JSON.parse(storedMenuRaw);
            } catch (error) {
                 console.error("Failed to parse menu from localStorage, using default.", error);
            }
        }
        setMenu(menuToLoad);
        setIsMenuLoaded(true);
    }, [restaurant.id]);

    useEffect(() => {
        loadMenu();
    }, [loadMenu]);

    useEffect(() => {
        if (isMenuLoaded) {
            loadItems();
            
            const interval = setInterval(loadItems, 4000); // Auto-refresh every 4 seconds
    
            return () => {
                clearInterval(interval); // Cleanup on component unmount
            };
        }
    }, [isMenuLoaded, loadItems]);
    
    
    const handleUpdateStatus = (itemsToUpdate: GroupedItem['originalItems'], newStatus: OrderItem['itemStatus']) => {
        updateOrderStatusForItems(restaurant.id, itemsToUpdate, newStatus);
        
        let message = '';
        if (newStatus === 'Pronto') {
            message = 'O item foi marcado como pronto para ser servido.';
        } else if (newStatus === 'Entregue') {
            message = 'O item foi marcado como entregue na mesa.';
        }
        
        if (message) {
            toast({
                title: 'Status Atualizado!',
                description: message,
            });
        }
    }

    const handlePrintTicket = (orderId: string, department: string) => {
        window.open(`/print/production-ticket/${orderId}?department=${encodeURIComponent(department)}`, '_blank');
    };

    const pendingItems = useMemo(() => allItems.filter(item => item.status === 'Pendente'), [allItems]);
    const deliveryItems = useMemo(() => allItems.filter(item => item.status === 'Pronto' || item.status === 'Entregue'), [allItems]);
    
    const productionGroups = useMemo(() => {
        return pendingItems.reduce((acc, item) => {
            const department = item.department || 'Cozinha';
            if (!acc[department]) {
                acc[department] = [];
            }
            acc[department].push(item);
            return acc;
        }, {} as Record<string, GroupedItem[]>);
    }, [pendingItems]);


    if (!isMenuLoaded) {
        return <p>Carregando painel de produção...</p>;
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl font-bold">Painel de Produção (KDS)</CardTitle>
                    <CardDescription>Acompanhe em tempo real os pedidos para cada grupo de produção.</CardDescription>
                </CardHeader>
            </Card>
            <div className="flex flex-col md:flex-row gap-6">
                {Object.entries(productionGroups).map(([department, items]) => (
                    <Card className="flex-1" key={department}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ChefHat /> {department} <Badge>{items.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             {items.length > 0 ? (
                                <div className="space-y-4">
                                    {items.map((item, index) => {
                                        const orderId = item.originalItems[0]?.orderId;
                                        return (
                                            <div key={`${item.comandaId}-${item.name}-${index}`} className="p-3 border rounded-lg flex flex-col items-start gap-3">
                                                <div>
                                                    <p className="font-bold text-lg">{item.quantity}x {item.name}</p>
                                                    <p className="text-sm text-muted-foreground">Comanda: <span className="font-semibold">{item.comandaId}</span> (Mesa {item.tableNumber})</p>
                                                    {item.description && <p className="text-xs text-blue-600 mt-1">Obs: {item.description}</p>}
                                                </div>
                                                <div className="flex w-full justify-between items-center gap-2">
                                                    <Button size="sm" onClick={() => handleUpdateStatus(item.originalItems, 'Pronto')}>
                                                        <Check className="mr-2 h-4 w-4"/>
                                                        Pronto
                                                    </Button>
                                                     {orderId && (
                                                        <Button variant="outline" size="sm" onClick={() => handlePrintTicket(orderId, department)}>
                                                            <Printer className="mr-2 h-4 w-4"/>
                                                            Imprimir Ticket
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>Nenhum pedido pendente.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="my-6 border-t pt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl font-bold flex items-center gap-2">
                            <Truck />
                            Itens para Entrega
                            <Badge variant="secondary">{deliveryItems.length}</Badge>
                        </CardTitle>
                        <CardDescription>Itens que estão prontos para servir ou já foram entregues à mesa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {deliveryItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {deliveryItems.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((item, index) => (
                                    <div key={`${item.comandaId}-${item.name}-${item.status}-${index}`} 
                                         className={cn(
                                            "p-3 border rounded-lg flex flex-col items-start gap-2",
                                            item.status === 'Pronto' && "bg-green-500/10 border-green-500/30",
                                            item.status === 'Entregue' && "bg-gray-500/10 border-gray-500/20 opacity-70"
                                         )}>
                                        <p className="font-bold text-lg">{item.quantity}x {item.name}</p>
                                        <p className="text-sm">Comanda: <span className="font-semibold text-lg">{item.comandaId}</span> (Mesa {item.tableNumber})</p>
                                        
                                        {item.status === 'Pronto' ? (
                                            <>
                                                <Badge variant="secondary" className="bg-green-600 text-white">
                                                    <CheckCheck className="mr-1.5 h-3 w-3"/>
                                                    Pronto ({item.department})
                                                </Badge>
                                                <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => handleUpdateStatus(item.originalItems, 'Entregue')}>
                                                    Marcar como Entregue
                                                </Button>
                                            </>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-600 text-white">
                                                <CheckCheck className="mr-1.5 h-3 w-3"/>
                                                Entregue
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Nenhum item aguardando entrega.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
