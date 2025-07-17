

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Search, Send, Trash2, Check, DollarSign, CreditCard, Smartphone, MinusCircle, Hand } from "lucide-react";
import type { Restaurant, Table as TableData, Employee } from "@/lib/restaurants-data";
import { MenuItem } from "@/lib/menu-data";
import { Order, OrderItem, addOrUpdateOrder, getOrderByTableId, finalizeOrder, PaymentMethod, getSubtotalAndFee, cancelOrderItem, calculateOrderSubtotal, updateOrderStatus } from "@/lib/order-store";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

function FinalizeOrderDialog({ order, restaurant, menu, onFinalized, disabled }: { order: Order, restaurant: Restaurant, menu: MenuItem[], onFinalized: () => void, disabled: boolean }) {
    const { toast } = useToast();
    const [cpf, setCpf] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [amountPaid, setAmountPaid] = useState<number | string>("");
    const [includeServiceFee, setIncludeServiceFee] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const canGenerateCode = restaurant.plan === 'Completo';

    const { subtotal, serviceFee } = getSubtotalAndFee(order, menu);
    const totalAmount = includeServiceFee ? subtotal + serviceFee : subtotal;
    
    const changeAmount = (paymentMethod === 'Dinheiro' && typeof amountPaid === 'number' && amountPaid >= totalAmount)
        ? amountPaid - totalAmount
        : 0;

    const handleFinalizeClick = () => {
        if (!paymentMethod) {
            toast({
                title: "Método de Pagamento Necessário",
                description: "Por favor, selecione como o cliente pagou.",
                variant: "destructive",
            });
            return;
        }

        const finalizedOrder = finalizeOrder(
            order,
            paymentMethod,
            canGenerateCode,
            includeServiceFee,
            cpf,
            typeof amountPaid === 'number' ? amountPaid : undefined
        );

        if (finalizedOrder) {
            toast({
                title: "Pedido Finalizado",
                description: `A conta da mesa ${order.tableNumber} foi paga e o recibo foi gerado.`
            });
            window.open(`/receipt/${finalizedOrder.id}?restaurantId=${finalizedOrder.restaurantId}`, '_blank');
            onFinalized();
        } else {
             toast({
                title: "Erro ao Finalizar",
                description: `Não foi possível finalizar o pedido.`,
                variant: "destructive"
            });
        }
    };
    
    const onDialogOpenChange = (isOpen: boolean) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) {
            setCpf("");
            setPaymentMethod(null);
            setAmountPaid("");
            setIncludeServiceFee(true);
        }
    }

    const FinalizeButton = (
         <Button className="w-full bg-green-600 hover:bg-green-700" disabled={disabled}>
            <Check className="mr-2 h-4 w-4" />
            Finalizar Pedido
        </Button>
    );

    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
            <DialogTrigger asChild>
                {disabled ? (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">{FinalizeButton}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Salve ou envie os itens para produção antes de finalizar.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    FinalizeButton
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Finalizar Conta da Mesa {order.tableNumber}</DialogTitle>
                    <DialogDescription>
                        Selecione o método de pagamento e confirme para fechar a conta.
                        {canGenerateCode && " Um código de resgate será gerado."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <Switch id="service-fee-switch" checked={includeServiceFee} onCheckedChange={setIncludeServiceFee}/>
                        <div className="flex-1">
                            <Label htmlFor="service-fee-switch" className="font-bold">Incluir Taxa de Serviço (10%)</Label>
                            <p className="text-xs text-muted-foreground">Valor da taxa: {serviceFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>

                    <Separator/>
                     <div className="text-right">
                        <p className="text-sm text-muted-foreground">Subtotal: {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p className="text-2xl font-bold text-primary">Total: {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <Separator/>


                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right col-span-1">Pagamento</Label>
                        <RadioGroup 
                            className="col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-2"
                            value={paymentMethod || ""}
                            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                        >
                            <Label htmlFor="payment-cash" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="Dinheiro" id="payment-cash" className="sr-only" />
                                <DollarSign className="mb-1 h-5 w-5"/>
                                Dinheiro
                            </Label>
                            <Label htmlFor="payment-credit" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="Crédito" id="payment-credit" className="sr-only" />
                                <CreditCard className="mb-1 h-5 w-5"/>
                                Crédito
                            </Label>
                            <Label htmlFor="payment-debit" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="Débito" id="payment-debit" className="sr-only" />
                                <CreditCard className="mb-1 h-5 w-5"/>
                                Débito
                            </Label>
                             <Label htmlFor="payment-pix" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="Pix" id="payment-pix" className="sr-only" />
                                <Smartphone className="mb-1 h-5 w-5"/>
                                Pix
                            </Label>
                        </RadioGroup>
                    </div>
                     {paymentMethod === 'Dinheiro' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor={`amount-paid-${order.id}`} className="text-right">
                                Valor Recebido
                            </Label>
                            <Input
                                id={`amount-paid-${order.id}`}
                                type="number"
                                placeholder="Ex: 150.00"
                                className="col-span-3"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            />
                        </div>
                    )}
                    {paymentMethod === 'Dinheiro' && changeAmount > 0 && (
                         <div className="grid grid-cols-4 items-center gap-4">
                             <Label className="text-right font-bold">
                                Troco
                            </Label>
                            <div className="col-span-3 text-lg font-bold text-primary">
                                {changeAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`cpf-${order.id}`} className="text-right">
                            CPF na nota
                        </Label>
                        <Input id={`cpf-${order.id}`} placeholder="(Opcional)" className="col-span-3" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleFinalizeClick} disabled={!paymentMethod}>
                        Finalizar e Gerar Recibo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function ItemCancellationDialog({
    restaurantId,
    orderId,
    orderItem,
    menuItem,
    employees,
    onCancelled
}: {
    restaurantId: string;
    orderId: string;
    orderItem: OrderItem;
    menuItem?: MenuItem;
    employees: Employee[];
    onCancelled: () => void;
}) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const handleConfirmCancellation = () => {
        const employee = employees.find(emp => emp.login === login);
        if (!employee || employee.password !== password) {
            toast({ title: "Credenciais Inválidas", description: "O login ou senha do funcionário está incorreto.", variant: "destructive" });
            setPassword("");
            return;
        }

        cancelOrderItem(restaurantId, orderId, orderItem.createdAt, employee.name);
        toast({
            title: "Item Cancelado",
            description: `${orderItem.quantity}x ${menuItem?.name || 'Item'} foi removido do pedido por ${employee.name}.`
        });
        onCancelled();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                setLogin("");
                setPassword("");
            }
        }}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancelar Item do Pedido</DialogTitle>
                    <DialogDescription>
                        Para cancelar o item <span className="font-bold">{orderItem.quantity}x {menuItem?.name || 'Item'}</span>, é necessária a autorização de um funcionário.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div>
                        <Label htmlFor="cancellation-login">Login do Funcionário</Label>
                        <Input id="cancellation-login" value={login} onChange={(e) => setLogin(e.target.value)} />
                     </div>
                      <div>
                        <Label htmlFor="cancellation-password">Senha do Funcionário</Label>
                        <Input id="cancellation-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                     </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Voltar</Button></DialogClose>
                    <Button variant="destructive" onClick={handleConfirmCancellation}>Confirmar Cancelamento</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface OrderSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  table: TableData | null;
  restaurant: Restaurant;
  menu: MenuItem[];
  currentUserRole: Employee['role'];
  onOrderFinalized?: () => void;
}

export function OrderSheet({ isOpen, onOpenChange, table, restaurant, menu: initialMenu, currentUserRole, onOrderFinalized }: OrderSheetProps) {
  const { toast } = useToast();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);

  const loadOrder = useCallback(() => {
    if (table) {
        let order = getOrderByTableId(restaurant.id, table.id);
        if (!order) {
            order = {
                id: table.id, // Use table ID as order ID for simplicity
                tableId: table.id,
                tableNumber: table.number,
                restaurantId: restaurant.id,
                items: [],
                status: "Aberto",
                createdAt: new Date().toISOString()
            };
        }
        setCurrentOrder(order);
    }
  }, [table, restaurant.id]);

  useEffect(() => {
    setMenu(initialMenu.filter(item => item.isVisible !== false));
  }, [initialMenu, isOpen]);

  useEffect(() => {
    if (isOpen) {
        loadOrder();
        setSearchTerm("");
    } else {
        setCurrentOrder(null); // Clear order when sheet closes
    }
  }, [isOpen, loadOrder]);
  
  const handleAddItem = (menuItem: MenuItem) => {
    if (!currentOrder) return;

    // Create a new item object without a createdAt yet
    const newItem: OrderItem = {
        itemId: menuItem.id,
        quantity: 1,
        itemStatus: 'Lançamento',
        department: menuItem.department,
        printGroup: menuItem.printGroup,
        createdAt: `${Date.now()}-${Math.random()}`
    };
    
    // Pass the item to the central store function to handle unique ID creation
    setCurrentOrder(prevOrder => {
      if (!prevOrder) return null;
      return { ...prevOrder, items: [...prevOrder.items, newItem] };
    });
};

  const handleQuantityChange = (createdAt: string, delta: number) => {
    setCurrentOrder(prevOrder => {
        if (!prevOrder) return null;
        
        let itemFound = false;
        const updatedItems = prevOrder.items.map(i => {
            if (i.createdAt === createdAt) {
                itemFound = true;
                const newQuantity = i.quantity + delta;
                return newQuantity > 0 ? { ...i, quantity: newQuantity } : null;
            }
            return i;
        }).filter(Boolean) as OrderItem[]; // Filter out nulls
        
        return itemFound ? {...prevOrder, items: updatedItems} : prevOrder;
    });
  };
  
  const handleSendToProduction = () => {
    if (!currentOrder) return;

    const newItemsByPrintGroup: Record<string, boolean> = {};

    const itemsToSend = currentOrder.items.map(item => {
        if (item.itemStatus === 'Lançamento') {
            newItemsByPrintGroup[item.printGroup] = true;
            return { ...item, itemStatus: 'Pendente' as const };
        }
        return item;
    });
    
    if (Object.keys(newItemsByPrintGroup).length === 0) {
        toast({
            title: "Nenhum item novo",
            description: "Adicione novos itens antes de enviar para produção.",
            variant: "destructive"
        });
        return;
    }

    const updatedOrder = { ...currentOrder, items: itemsToSend };
    
    const savedOrder = addOrUpdateOrder(updatedOrder);
    setCurrentOrder(savedOrder);
    
    Object.keys(newItemsByPrintGroup).forEach(printGroup => {
        setTimeout(() => {
            window.open(`/print/production-ticket/${savedOrder.id}?department=${encodeURIComponent(printGroup)}`, `_blank`);
        }, 100);
    });

    toast({
        title: "Pedido Enviado!",
        description: `Novos itens enviados para a produção.`
    });
  };

    const handleRequestPayment = () => {
        if (!currentOrder) return;

        // First, ensure any draft items are saved and sent.
        const draftItems = currentOrder.items.filter(i => i.itemStatus === 'Lançamento');
        if (draftItems.length > 0) {
            handleSendToProduction();
        }

        updateOrderStatus(restaurant.id, currentOrder.id, 'Aguardando Pagamento');
        onOpenChange(false);
        toast({
            title: "Conta em Fechamento",
            description: `O caixa foi notificado para receber o pagamento da mesa ${currentOrder.tableNumber}.`,
        });
    };

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const groupedMenu = filteredMenu.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {} as Record<MenuItem['category'], MenuItem[]>);

  if (!table || !currentOrder) {
      return null;
  }
  
  const itemsInDraft = currentOrder.items.filter(i => i.itemStatus === 'Lançamento');
  const itemsSent = currentOrder.items.filter(i => i.itemStatus !== 'Lançamento');

  const draftSubtotal = itemsInDraft.reduce((sum, orderItem) => {
    const menuItem = menu.find(m => m.id === orderItem.itemId);
    if (!menuItem) return sum;
    const price = parseFloat(String(menuItem.price).replace("R$", "").replace(",", ".").trim() || '0');
    return sum + (price * orderItem.quantity);
  }, 0);

  const sentSubtotal = calculateOrderSubtotal({ ...currentOrder, items: itemsSent }, menu);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-3xl">Mesa {table?.number}</SheetTitle>
          <SheetDescription>
            Adicione itens e depois envie para produção. Itens já enviados não podem ser editados aqui.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 overflow-hidden py-4">
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input 
                        placeholder="Buscar no cardápio..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ScrollArea className="h-[calc(100vh-250px)] pr-4 -mr-4">
                    <div className="space-y-6">
                        {Object.entries(groupedMenu).map(([category, items]) => (
                            <div key={category}>
                                <h4 className="text-lg font-semibold mb-3">{category}</h4>
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.price}</p>
                                            </div>
                                            <Button size="icon" variant="outline" onClick={() => handleAddItem(item)}>
                                                <PlusCircle className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <div className="lg:col-span-3 flex flex-col gap-4 border-l pl-6 -ml-3">
                <h4 className="text-lg font-semibold">Resumo do Pedido</h4>
                <ScrollArea className="flex-1 pr-2">
                    {itemsSent.length > 0 && (
                        <div className="mb-4">
                            <h5 className="font-semibold text-muted-foreground mb-2">Itens na Conta</h5>
                             <div className="space-y-3 text-sm">
                                {itemsSent.map(orderItem => {
                                    const menuItem = menu.find(m => m.id === orderItem.itemId);
                                    const isCancelled = orderItem.itemStatus === 'Cancelado';
                                    return (
                                        <div key={orderItem.createdAt} className={cn("flex items-center gap-2", isCancelled && "opacity-50")}>
                                            <div className="flex-1">
                                                <p className={cn(isCancelled && "line-through")}>{orderItem.quantity}x {menuItem?.name || 'Item desconhecido'}</p>
                                                <p className="text-xs">{isCancelled ? `Cancelado por ${orderItem.cancelledBy}` : `(${orderItem.itemStatus})`}</p>
                                            </div>
                                            <div className={cn("font-medium", isCancelled && "line-through")}>
                                                R$ {((parseFloat(String(menuItem?.price).replace("R$", "").replace(",", ".").trim() || '0')) * orderItem.quantity).toFixed(2)}
                                            </div>
                                             {currentUserRole === 'Caixa' && !isCancelled && (
                                                <ItemCancellationDialog 
                                                    restaurantId={restaurant.id}
                                                    orderId={currentOrder.id}
                                                    orderItem={orderItem}
                                                    menuItem={menuItem}
                                                    employees={restaurant.employees || []}
                                                    onCancelled={loadOrder}
                                                />
                                            )}
                                        </div>
                                    )}
                                )}
                            </div>
                        </div>
                    )}

                    {itemsInDraft.length > 0 && (
                       <div>
                            <h5 className="font-semibold text-primary mb-2">Itens em Lançamento</h5>
                            <div className="space-y-3">
                                {itemsInDraft.map(orderItem => {
                                    const menuItem = menu.find(m => m.id === orderItem.itemId);
                                    return (
                                        <div key={orderItem.createdAt} className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <p className="font-medium">{menuItem?.name || 'Item desconhecido'}</p>
                                                <p className="text-sm text-muted-foreground">{menuItem?.price}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleQuantityChange(orderItem.createdAt, -1)}>
                                                    <MinusCircle className="h-4 w-4"/>
                                                </Button>
                                                <span className="w-6 text-center font-bold">{orderItem.quantity}</span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleQuantityChange(orderItem.createdAt, 1)}>
                                                    <PlusCircle className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                )}
                            </div>
                        </div>
                    )}

                    {currentOrder.items.length === 0 && (
                        <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                            <p>Nenhum item adicionado.</p>
                        </div>
                    )}
                </ScrollArea>
                <Separator />
                <div className="space-y-1 font-bold">
                     <div className="flex justify-between items-center text-lg text-muted-foreground">
                        <span>Subtotal Conta</span>
                        <span>{sentSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span>Lançamento Atual</span>
                        <span>{draftSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl text-primary border-t pt-1">
                        <span>Total Geral</span>
                        <span>{(sentSubtotal + draftSubtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>
            </div>
        </div>
        <SheetFooter className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4">
             {currentUserRole === 'Garçom' && (
                <>
                <Button variant="secondary" onClick={handleRequestPayment}>
                    <Hand className="mr-2 h-4 w-4"/> Fechar Conta
                </Button>
                <Button onClick={handleSendToProduction} disabled={itemsInDraft.length === 0}>
                    <Send className="mr-2 h-4 w-4"/> Enviar para Produção
                </Button>
                </>
             )}
             {currentUserRole === 'Caixa' && (
                <div className="md:col-span-2">
                    <FinalizeOrderDialog 
                        order={currentOrder} 
                        restaurant={restaurant} 
                        menu={menu}
                        onFinalized={() => {
                            if (onOrderFinalized) onOrderFinalized();
                        }}
                        disabled={itemsInDraft.length > 0}
                    />
                </div>
             )}
             {currentUserRole !== 'Garçom' && currentUserRole !== 'Caixa' && (
                 <div className="md:col-span-2">
                    <p className="text-xs text-center text-muted-foreground">Apenas Garçons e Caixas podem alterar o pedido.</p>
                 </div>
             )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

