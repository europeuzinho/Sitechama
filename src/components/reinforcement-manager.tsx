

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useToast } from '@/hooks/use-toast';
import { Reinforcement, addReinforcementToSession } from '@/lib/cash-session-store';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusSquare, PlusCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface ReinforcementManagerProps {
  restaurantId: string;
  reinforcements: Reinforcement[];
  operatorName: string;
}

const reinforcementFormSchema = z.object({
  reason: z.string().min(3, "O motivo é obrigatório."),
  amount: z.coerce.number().positive("O valor deve ser maior que zero."),
});

export function ReinforcementManager({ restaurantId, reinforcements, operatorName }: ReinforcementManagerProps) {
  const { toast } = useToast();
  const [isFormVisible, setIsFormVisible] = useState(false);

  const form = useForm<z.infer<typeof reinforcementFormSchema>>({
    resolver: zodResolver(reinforcementFormSchema),
    defaultValues: { reason: "", amount: 0 },
  });

  const handleAddReinforcement = (values: z.infer<typeof reinforcementFormSchema>) => {
    if (!operatorName) {
        toast({ title: "Erro", description: "Operador não identificado.", variant: "destructive" });
        return;
    }

    const newReinforcement = addReinforcementToSession(restaurantId, { ...values, addedBy: operatorName });

    if (newReinforcement) {
        toast({ title: "Reforço Registrado", description: `R$ ${values.amount.toFixed(2)} adicionado ao caixa.` });
        window.open(`/reinforcement-receipt/${newReinforcement.id}?restaurantId=${restaurantId}`, '_blank');
        form.reset();
        setIsFormVisible(false);
    } else {
        toast({ title: "Erro", description: "Não foi possível registrar o reforço de caixa.", variant: "destructive" });
    }
  };

  return (
    <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><PlusSquare className="text-green-600"/> Reforço de Caixa (Suprimento)</h3>
        <div className="space-y-4 p-4 border rounded-lg">
             {!isFormVisible && (
                <Button variant="outline" className="w-full" onClick={() => setIsFormVisible(true)}>
                    <PlusCircle className="mr-2"/>
                    Registrar Reforço
                </Button>
            )}

            {isFormVisible && (
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddReinforcement)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Reposição de troco" {...field} />
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
                                    <FormLabel>Valor a Adicionar</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="Ex: 100.00" {...field} />
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
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Histórico de Reforços</h4>
                 <ScrollArea className="h-24">
                    {reinforcements.length > 0 ? (
                        <div className="space-y-2 pr-4">
                        {reinforcements.map(item => (
                            <div key={item.id} className="text-xs flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{item.reason}</p>
                                    <p className="text-muted-foreground">Por: {item.addedBy}</p>
                                </div>
                                <div className="font-bold text-green-600">
                                    + {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center pt-4">Nenhum reforço nesta sessão.</p>
                    )}
                 </ScrollArea>
            </div>
        </div>
    </div>
  );
}
