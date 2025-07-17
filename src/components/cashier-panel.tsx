
"use client";

import { useState, useEffect, useCallback } from "react";
import { Order, getActiveOrdersByRestaurant, calculateOrderSubtotal } from "@/lib/order-store";
import { Restaurant } from "@/lib/restaurants-data";
import { MenuItem, menuData } from "@/lib/menu-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Printer, Hand } from "lucide-react";
import { OrderSheet } from "./order-sheet";

interface CashierPanelProps {
  restaurant: Restaurant;
}

const MENU_STORAGE_KEY_PREFIX = 'menuData-';

export function CashierPanel({ restaurant }: CashierPanelProps) {
  const [ordersAwaitingPayment, setOrdersAwaitingPayment] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = useCallback(() => {
    // Load Menu
    const storageKey = `${MENU_STORAGE_KEY_PREFIX}${restaurant.id}`;
    const storedMenuRaw = localStorage.getItem(storageKey);
    let menuToLoad: MenuItem[] = menuData[restaurant.id] || [];
    if (storedMenuRaw) {
        try {
            menuToLoad = JSON.parse(storedMenuRaw);
        } catch(e) {
            console.error("Failed to parse menu from localStorage, falling back to default.", e);
        }
    }
    setMenu(menuToLoad);

    // Load all active orders (not just 'Aguardando Pagamento')
    const allActiveOrders = getActiveOrdersByRestaurant(restaurant.id);
    setOrdersAwaitingPayment(allActiveOrders);

  }, [restaurant.id]);

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();

    window.addEventListener('menuChanged', handleDataChange);
    window.addEventListener('ordersChanged', handleDataChange);

    return () => {
      window.removeEventListener('menuChanged', handleDataChange);
      window.removeEventListener('ordersChanged', handleDataChange);
    };
  }, [loadData]);

  const handlePrintMirror = (order: Order) => {
    window.open(`/receipt/${order.id}?restaurantId=${restaurant.id}`, '_blank');
  };

  const openOrderSheetForPayment = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderSheetOpen(true);
  };
  
  const handleOrderFinalized = () => {
    loadData(); // Reload data to remove the finalized order from the list
    setIsOrderSheetOpen(false); // Close the sheet
    setSelectedOrder(null);
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl font-bold flex items-center gap-2">
          <Hand />
          Contas Abertas
        </CardTitle>
        <CardDescription>
          Visualize e finalize o pagamento de todas as contas ativas no restaurante.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordersAwaitingPayment.length > 0 ? (
            ordersAwaitingPayment
              .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((order) => {
                const orderSubtotal = calculateOrderSubtotal(order, menu);
                const serviceFee = orderSubtotal * 0.1;
                const total = orderSubtotal + serviceFee;
                
                return (
                  <Card key={order.id} className="flex flex-col border-2 border-primary/50 bg-primary/10">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                          <CardTitle className="text-xl">Mesa {order.tableNumber}</CardTitle>
                          <Badge variant={order.status === 'Aguardando Pagamento' ? 'default' : 'outline'}>
                           {order.status}
                          </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-4xl font-bold text-primary">
                          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                       <p className="text-xs text-muted-foreground">Subtotal: {orderSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </CardContent>
                    <CardFooter className="grid grid-cols-1 gap-2">
                      <Button variant="default" className="w-full" onClick={() => openOrderSheetForPayment(order)}>
                          <Wallet className="mr-2 h-4 w-4" />
                          Finalizar Pagamento
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => handlePrintMirror(order)}>
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir Espelho
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nenhuma conta aberta no momento.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
      {selectedOrder && (
        <OrderSheet 
            isOpen={isOrderSheetOpen}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setSelectedOrder(null);
                }
                setIsOrderSheetOpen(isOpen);
            }}
            table={{ id: selectedOrder.tableId, number: selectedOrder.tableNumber, capacity: 0, priority: 0, status: 'occupied' }} // Pass a mock table
            restaurant={restaurant}
            menu={menu}
            currentUserRole="Caixa"
            onOrderFinalized={handleOrderFinalized}
        />
    )}
    </>
  );
}
