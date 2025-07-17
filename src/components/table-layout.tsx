

"use client";

import { useState, useEffect, useCallback } from "react";
import { Order, getActiveOrdersByRestaurant, calculateOrderSubtotal, getOrderByTableId } from "@/lib/order-store";
import { Restaurant, Table as TableData, Employee } from "@/lib/restaurants-data";
import { MenuItem, menuData } from "@/lib/menu-data";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderSheet } from "./order-sheet";
import { cn } from "@/lib/utils";
import { Users, FilePlus } from 'lucide-react';
import { Separator } from "./ui/separator";

interface TableLayoutProps {
    restaurant: Restaurant;
    currentUserRole: Employee['role'];
}

const MENU_STORAGE_KEY_PREFIX = 'menuData-';

export function TableLayout({ restaurant, currentUserRole }: TableLayoutProps) {
    const { toast } = useToast();
    const [tables, setTables] = useState<TableData[]>([]);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    
    const loadData = useCallback(() => {
        if (typeof window === 'undefined') return;
        setTables(restaurant.tables || []);
        setActiveOrders(getActiveOrdersByRestaurant(restaurant.id));

        const storageKey = `${MENU_STORAGE_KEY_PREFIX}${restaurant.id}`;
        const storedMenuRaw = localStorage.getItem(storageKey);
        const loadedMenu = storedMenuRaw ? JSON.parse(storedMenuRaw) : (menuData[restaurant.id] || []);
        setMenu(loadedMenu);
        setIsDataLoaded(true);

    }, [restaurant]);

    useEffect(() => {
        loadData();
        const handleDataChange = () => loadData();
        window.addEventListener('restaurantsChanged', handleDataChange);
        window.addEventListener('ordersChanged', handleDataChange);
        
        return () => {
            window.removeEventListener('restaurantsChanged', handleDataChange);
            window.removeEventListener('ordersChanged', handleDataChange);
        };
    }, [loadData]);
    
    const handleTableClick = (table: TableData) => {
        if (currentUserRole === 'Garçom' || currentUserRole === 'Caixa' || currentUserRole === 'Recepção') {
            setSelectedTable(table);
            setIsOrderSheetOpen(true);
        } else {
            toast({
                title: "Acesso Restrito",
                description: "Você não tem permissão para gerenciar mesas.",
                variant: "destructive"
            });
        }
    };
    
    const getOverallTableStatus = (order: Order | undefined) => {
        if (!order) {
            return { text: 'Livre', color: 'bg-green-500 border-green-600' };
        }
        if (order.status === 'Aguardando Pagamento') {
            return { text: 'Pagamento', color: 'bg-purple-500 border-purple-600' };
        }
        return { text: 'Ocupada', color: 'bg-red-500 border-red-600' };
    };
    
    if (!isDataLoaded) {
        return <div className="text-center p-8">Carregando layout de mesas...</div>
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.sort((a, b) => a.priority - b.priority || parseInt(a.number.replace(/\D/g,'')) - parseInt(b.number.replace(/\D/g,''))).map(table => {
                    const orderForTable = getOrderByTableId(restaurant.id, table.id);
                    const isOccupied = !!orderForTable;
                    const statusInfo = getOverallTableStatus(orderForTable);
                    const totalTableValue = orderForTable ? calculateOrderSubtotal(orderForTable, menu) : 0;

                    return (
                        <Card 
                            key={table.id} 
                            onClick={() => handleTableClick(table)}
                            className={cn(
                                "flex flex-col justify-between transition-all border-2 cursor-pointer",
                                !isOccupied && "bg-card hover:bg-secondary",
                                isOccupied && statusInfo.text === 'Ocupada' && 'bg-red-100 border-red-400',
                                statusInfo.text === 'Pagamento' && 'bg-purple-100 border-purple-400'
                            )}
                        >
                            <CardHeader className="pb-2 text-center">
                                <CardTitle className="text-4xl font-bold">{table.number}</CardTitle>
                                <CardDescription className="flex items-center justify-center gap-1">
                                    <Users className="h-3 w-3"/>
                                    <span>{table.capacity} pessoas</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-center items-center h-20">
                                {isOccupied ? (
                                    <div className="text-center w-full">
                                         <p className="text-sm font-bold text-primary mt-1">
                                            Total: {totalTableValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground p-4">
                                       <p>Livre</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <Badge className={cn("w-full justify-center text-white", statusInfo.color)}>
                                    {statusInfo.text}
                                </Badge>
                                 {currentUserRole === 'Garçom' && !isOccupied && (
                                     <Button className="w-full" variant="default" size="sm" onClick={() => handleTableClick(table)}>
                                        <FilePlus className="mr-2 h-4 w-4"/>
                                        Abrir Pedido
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
                 {tables.length === 0 && (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        <p>Nenhuma mesa configurada.</p>
                        <Button variant="link" asChild>
                            <a href={`/admin/dashboard/${restaurant.id}`}>Ir para o painel de admin para configurar as mesas.</a>
                        </Button>
                    </div>
                )}
            </div>
             {selectedTable && (
                <OrderSheet 
                    isOpen={isOrderSheetOpen}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setSelectedTable(null);
                        }
                        setIsOrderSheetOpen(isOpen);
                    }}
                    table={selectedTable}
                    restaurant={restaurant}
                    menu={menu}
                    currentUserRole={currentUserRole}
                />
            )}
        </>
    );
}
