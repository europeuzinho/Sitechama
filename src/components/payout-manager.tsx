
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useToast } from '@/hooks/use-toast';
import { addPayoutToSession, Payout } from '@/lib/cash-session-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MinusSquare, Printer, PlusCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface PayoutManagerProps {
  restaurantId: string;
  payouts: Payout[];
}

const payoutFormSchema = z.object({
  recipient: z.string().min(2, "O nome do beneficiário é obrigatório."),
  reason: z.string().min(3, "O motivo é obrigatório."),
  amount: z.coerce.number().positive("O valor deve ser maior que zero."),
});

export function PayoutManager({ restaurantId, payouts }: PayoutManagerProps) {
  const { toast } = useToast();
  const [isFormVisible, setIsFormVisible] = useState(false);

  const form = useForm<z.infer<typeof payoutFormSchema>>({
    resolver: zodResolver(payoutFormSchema),
    defaultValues: { recipient: "", reason: "", amount: 0 },
  });

  const handleAddPayout = (values: z.infer<typeof payoutFormSchema>) => {
    const newPayout = addPayoutToSession(restaurantId, values);
    if (newPayout) {
        toast({ title: "Retirada Registrada", description: `R$ ${values.amount.toFixed(2)} retirado para ${values.recipient}.` });
        window.open(`/payout-receipt/${newPayout.id}?restaurantId=${restaurantId}`, '_blank');
        form.reset();
        setIsFormVisible(false);
    } else {
        toast({ title: "Erro", description: "Não foi possível registrar a retirada.", variant: "destructive" });
    }
  };

  return (
    <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><MinusSquare /> Retiradas de Caixa (Sangria)</h3>
        <div className="space-y-4 p-4 border rounded-lg">
             {!isFormVisible && (
                <Button variant="outline" className="w-full" onClick={() => setIsFormVisible(true)}>
                    <PlusCircle className="mr-2"/>
                    Registrar Nova Retirada
                </Button>
            )}

            {isFormVisible && (
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddPayout)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="recipient"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Beneficiário</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome do Freelancer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Pagamento DJ" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="Ex: 150.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">Registrar e Imprimir</Button>
                            <Button type="button" variant="ghost" onClick={() => setIsFormVisible(false)}>Cancelar</Button>
                        </div>
                    </form>
                </Form>
            )}

           
            <div className="pt-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Histórico de Saídas</h4>
                 <ScrollArea className="h-24">
                    {payouts.length > 0 ? (
                        <div className="space-y-2 pr-4">
                        {payouts.map(payout => (
                            <div key={payout.id} className="text-xs flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{payout.recipient}</p>
                                    <p className="text-muted-foreground">{payout.reason}</p>
                                </div>
                                <div className="font-bold text-destructive">
                                    - {payout.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center pt-4">Nenhuma retirada nesta sessão.</p>
                    )}
                 </ScrollArea>
            </div>
        </div>
    </div>
  );
}
