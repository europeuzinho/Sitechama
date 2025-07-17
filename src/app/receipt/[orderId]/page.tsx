

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, notFound, useSearchParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Order, OrderItem, getOrderById } from "@/lib/order-store";
import { MenuItem, menuData } from "@/lib/menu-data";
import { Restaurant, getRestaurants } from "@/lib/restaurants-data";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MENU_STORAGE_KEY_PREFIX = 'menuData-';

// Interface for grouped items on the receipt
interface GroupedItem {
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

const maskCpf = (cpf: string): string => {
    if (!cpf || cpf.length < 11) return "";
    const digitsOnly = cpf.replace(/\D/g, '');
    if (digitsOnly.length !== 11) return "";
    return `${digitsOnly.substring(0, 3)}.***.***-**`;
};

const processOrderItemsForReceipt = (order: Order, menu: MenuItem[]): GroupedItem[] => {
    if (!order || !order.items || !menu.length) {
        return [];
    }

    const itemMap = new Map<string, GroupedItem>();

    for (const orderItem of order.items) {
        if (orderItem.itemStatus === 'Cancelado') {
            continue;
        }

        const menuItem = menu.find(m => m.id === orderItem.itemId);
        if (!menuItem) {
            console.warn(`Menu item with ID ${orderItem.itemId} not found. Skipping.`);
            continue;
        }
        
        const priceString = String(menuItem.price).replace("R$", "").replace(",", ".").trim();
        const unitPrice = parseFloat(priceString);

        if (isNaN(unitPrice)) {
            console.warn(`Could not parse price for item ${menuItem.name}. Skipping.`);
            continue;
        }

        if (itemMap.has(orderItem.itemId)) {
            const existingItem = itemMap.get(orderItem.itemId)!;
            existingItem.quantity += orderItem.quantity;
        } else {
            itemMap.set(orderItem.itemId, {
                itemId: orderItem.itemId,
                name: menuItem.name,
                unitPrice: unitPrice,
                quantity: orderItem.quantity,
            });
        }
    }

    return Array.from(itemMap.values());
};


export default function ReceiptPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = params.orderId as string;
    const restaurantId = searchParams.get('restaurantId');

    const [order, setOrder] = useState<Order | null>(null);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(() => {
        setIsLoading(true);
        if (!orderId || !restaurantId) {
            notFound();
            return;
        }

        const foundOrder = getOrderById(restaurantId, orderId);
        if (!foundOrder) {
            notFound();
            return;
        }
        setOrder(foundOrder);

        const foundRestaurant = getRestaurants().find(r => r.id === foundOrder.restaurantId);
        setRestaurant(foundRestaurant || null);
        
        if (foundRestaurant) {
            const storageKey = `${MENU_STORAGE_KEY_PREFIX}${foundRestaurant.id}`;
            const storedMenuRaw = localStorage.getItem(storageKey);
            let menuToLoad: MenuItem[] = menuData[foundRestaurant.id] || [];
            if (storedMenuRaw) {
                try {
                    menuToLoad = JSON.parse(storedMenuRaw);
                } catch(e) {
                    console.error("Failed to parse menu from localStorage, falling back to default.", e);
                }
            }
            setMenu(menuToLoad);
        }
        
        setIsLoading(false);
    }, [orderId, restaurantId]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    if (isLoading) {
        return (
            <main className="bg-gray-100 min-h-screen p-4 sm:p-8 flex justify-center">
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-4">
                    <Skeleton className="h-20 w-20 mx-auto rounded-full" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Separator />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Separator />
                    <Skeleton className="h-20 w-full" />
                    <Separator />
                    <Skeleton className="h-8 w-1/2 ml-auto" />
                </div>
            </main>
        )
    }

    if (!order || !restaurant) {
        return notFound();
    }
    
    const itemsForDisplay = processOrderItemsForReceipt(order, menu);
    const subtotal = itemsForDisplay.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const serviceFee = subtotal * 0.10;
    const isFinalReceipt = order.status === 'Finalizado';
    const total = isFinalReceipt && order.total ? order.total : (subtotal + serviceFee);
    const totalItemsCount = itemsForDisplay.reduce((sum, item) => sum + item.quantity, 0);

    const handlePrint = () => {
        window.print();
    };
    
    const changeAmount = order.amountPaid && total ? order.amountPaid - total : 0;

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
                    main, .receipt-container {
                       padding: 0;
                       margin: 0;
                       box-shadow: none;
                       border: none;
                    }
                     .receipt-container {
                        width: 80mm;
                        font-size: 10pt;
                    }
                }
            `}</style>
            <div className="receipt-container w-full max-w-sm bg-white shadow-lg rounded-lg p-6 relative font-mono">
                <Button onClick={handlePrint} variant="outline" size="icon" className="absolute top-4 right-4 no-print">
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Imprimir</span>
                </Button>

                <div className="text-center mb-6">
                    {isFinalReceipt && restaurant.logo && (
                        <Image
                            src={restaurant.logo}
                            alt={`Logo ${restaurant.name}`}
                            width={80}
                            height={80}
                            className="mx-auto mb-4 object-contain"
                            data-ai-hint="restaurant logo"
                        />
                    )}
                    <h1 className="text-xl font-bold uppercase">{isFinalReceipt ? restaurant.name : "Espelho de Comanda"}</h1>
                     {!isFinalReceipt && <p className="text-sm font-normal text-gray-700">{restaurant.name}</p>}
                    <p className="text-xs text-gray-600">{restaurant.address}</p>
                    <p className="text-xs text-gray-600">Tel: {restaurant.phone}</p>
                    {isFinalReceipt && <p className="text-xs text-gray-600 mt-2">Documento sem valor fiscal.</p>}
                     {!isFinalReceipt && <p className="text-xs text-gray-600 mt-2 font-bold">CONFERÊNCIA - SEM VALOR FISCAL</p>}
                </div>

                <Separator className="my-4 border-dashed" />

                <div className="text-xs text-gray-700 space-y-1 mb-4">
                    <div className="flex justify-between">
                        <span>Mesa:</span>
                        <span className="font-semibold">{order.tableNumber}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Total de Itens:</span>
                        <span className="font-semibold">{totalItemsCount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Data:</span>
                        <span className="font-semibold">{format(new Date(order.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                    </div>
                     {isFinalReceipt && order.clientCpf && (
                        <div className="flex justify-between">
                            <span>CPF na nota:</span>
                            <span className="font-semibold">{maskCpf(order.clientCpf)}</span>
                        </div>
                     )}
                </div>

                <Separator className="my-4 border-dashed" />

                <Table className="text-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="h-auto p-1">Item</TableHead>
                            <TableHead className="h-auto p-1 text-center">Qtd.</TableHead>
                            <TableHead className="h-auto p-1 text-right">Unit.</TableHead>
                            <TableHead className="h-auto p-1 text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {itemsForDisplay.map(item => (
                            <TableRow key={item.itemId}>
                                <TableCell className="py-1 px-1 font-medium">{item.name}</TableCell>
                                <TableCell className="py-1 px-1 text-center">{item.quantity}</TableCell>
                                <TableCell className="py-1 px-1 text-right">{item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell className="py-1 px-1 text-right font-semibold">{(item.unitPrice * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                <Separator className="my-4 border-dashed" />

                <div className="mt-4 space-y-2">
                     <div className="flex justify-between text-xs">
                        <span>Subtotal</span>
                        <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    {isFinalReceipt && order.serviceFeeApplied && (
                        <div className="flex justify-between text-xs">
                            <span>Taxa de Serviço</span>
                            <span>{(order.total! - subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    )}
                     {!isFinalReceipt && (
                        <div className="flex justify-between text-xs">
                            <span>Taxa de Serviço (Opcional)</span>
                            <span>{serviceFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-2 border-dashed">
                        <span>TOTAL</span>
                        <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                     {isFinalReceipt && order.paymentMethod && (
                         <div className="flex justify-between text-xs pt-2">
                            <span>Forma de Pagamento:</span>
                            <span className="font-semibold">{order.paymentMethod}</span>
                        </div>
                     )}
                      {isFinalReceipt && order.paymentMethod === 'Dinheiro' && order.amountPaid && (
                        <>
                         <div className="flex justify-between text-xs">
                            <span>Valor Recebido:</span>
                            <span className="font-semibold">{order.amountPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                         <div className="flex justify-between text-xs font-bold">
                            <span>TROCO:</span>
                            <span className="font-semibold">{changeAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        </>
                     )}
                </div>

                {isFinalReceipt && order.redemptionCode && (
                    <div className="mt-6 border-t-2 border-dashed pt-4 text-center">
                        <p className="text-xs text-gray-700">Obrigado pela sua visita!</p>
                        <p className="text-xs text-gray-600">Use este código no seu perfil para ganhar <span className="font-bold">5 pontos!</span></p>
                        <div className="my-2 p-2 bg-primary/10 border-2 border-dashed border-primary rounded-lg inline-block">
                             <p className="text-lg font-bold tracking-widest text-primary">{order.redemptionCode}</p>
                        </div>
                    </div>
                )}
                
                 {!isFinalReceipt && (
                     <div className="mt-6 text-center text-xs text-gray-400">
                        <p>Gerado por Chama.</p>
                    </div>
                 )}
            </div>
        </main>
    );
}
