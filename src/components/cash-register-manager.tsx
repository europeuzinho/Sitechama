

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Restaurant } from '@/lib/restaurants-data';
import { CashSession, startNewSession, closeActiveSession } from '@/lib/cash-session-store';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Lock, Unlock, TrendingUp, DollarSign, Calculator, ArrowRight, MinusSquare } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PayoutManager } from './payout-manager';
import { ReinforcementManager } from './reinforcement-manager';

interface CashRegisterManagerProps {
  restaurant: Restaurant;
  activeSession: CashSession | null;
  operatorName: string;
}

const openFormSchema = z.object({
  startAmount: z.coerce.number().min(0, "O valor deve ser positivo."),
});

const closeFormSchema = z.object({
  endAmount: z.coerce.number().min(0, "O valor deve ser positivo."),
});

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function CashRegisterManager({ restaurant, activeSession, operatorName }: CashRegisterManagerProps) {
  const { toast } = useToast();

  const openForm = useForm<z.infer<typeof openFormSchema>>({
    resolver: zodResolver(openFormSchema),
    defaultValues: { startAmount: 0 },
  });

  const closeForm = useForm<z.infer<typeof closeFormSchema>>({
    resolver: zodResolver(closeFormSchema),
    defaultValues: { endAmount: 0 },
  });

  const handleOpenRegister = (values: z.infer<typeof openFormSchema>) => {
    if (!operatorName) return;
    startNewSession(restaurant.id, operatorName, values.startAmount);
    toast({ title: "Caixa Aberto!", description: "O caixa foi aberto com sucesso e está pronto para receber vendas." });
  };

  const handleCloseRegister = (values: z.infer<typeof closeFormSchema>) => {
     if (!operatorName || !activeSession) return;
     const closedSession = closeActiveSession(restaurant.id, operatorName, values.endAmount);
     if (closedSession) {
        toast({ title: "Caixa Fechado", description: "O relatório de fechamento foi gerado em uma nova aba." });
        window.open(`/report/session/${closedSession.id}`, '_blank');
     } else {
        toast({ title: "Erro", description: "Não foi possível fechar o caixa.", variant: "destructive" });
     }
  };
  
  if (!activeSession) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
            <Unlock className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="font-headline text-3xl">Abrir Caixa</CardTitle>
            <CardDescription>Insira o valor inicial (fundo de troco) para começar o dia.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...openForm}>
                <form onSubmit={openForm.handleSubmit(handleOpenRegister)} className="space-y-4">
                    <FormField
                        control={openForm.control}
                        name="startAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Inicial</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" step="0.01" className="pl-10" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">
                        Abrir Caixa
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    );
  }

  // If session is active, show closing panel
  const { sales, payouts, reinforcements } = activeSession;
  const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
  const totalReinforcements = reinforcements.reduce((sum, r) => sum + r.amount, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Lock className="text-destructive"/>
            Gestão de Caixa
        </CardTitle>
        <CardDescription>
          Aberto por {activeSession.openedBy} em {format(new Date(activeSession.openedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReinforcementManager restaurantId={restaurant.id} reinforcements={reinforcements} operatorName={operatorName} />
        <PayoutManager restaurantId={restaurant.id} payouts={payouts} />
        <Separator />
        <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><TrendingUp/> Resumo da Sessão</h3>
            <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Vendas em Dinheiro</span> <strong>{formatCurrency(sales.byMethod.Dinheiro)}</strong></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Vendas em Crédito</span> <strong>{formatCurrency(sales.byMethod.Crédito)}</strong></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Vendas em Débito</span> <strong>{formatCurrency(sales.byMethod.Débito)}</strong></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Vendas em Pix</span> <strong>{formatCurrency(sales.byMethod.Pix)}</strong></div>
                <Separator/>
                <div className="flex justify-between items-center text-green-600"><span>Reforços (Suprimento)</span> <strong>+ {formatCurrency(totalReinforcements)}</strong></div>
                <div className="flex justify-between items-center text-destructive"><span>Saídas (Sangria)</span> <strong>- {formatCurrency(totalPayouts)}</strong></div>
                <Separator/>
                <div className="flex justify-between items-center text-lg"><span className="font-bold">Total Geral de Vendas</span> <strong className="text-primary">{formatCurrency(sales.total)}</strong></div>
            </div>
        </div>
        <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Calculator/> Fechar Caixa</h3>
            <div className="space-y-4 p-4 border rounded-lg">
                <Form {...closeForm}>
                    <form onSubmit={closeForm.handleSubmit(handleCloseRegister)} className="space-y-4">
                        <FormField
                            control={closeForm.control}
                            name="endAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor Contado em Dinheiro</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" step="0.01" className="pl-10 text-xl font-bold" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" className="w-full">
                                    Fechar Caixa e Gerar Relatório
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Fechamento do Caixa?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. A sessão atual será encerrada e o extrato será aberto em uma nova aba.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={closeForm.handleSubmit(handleCloseRegister)}>Confirmar Fechamento</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </form>
                </Form>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
