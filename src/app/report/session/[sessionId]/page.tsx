

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { CashSession, getSessionById } from "@/lib/cash-session-store";
import { Restaurant, getRestaurants } from "@/lib/restaurants-data";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer, Calendar, Clock, User, DollarSign, Calculator, AlertTriangle, CheckCircle, MinusSquare, PlusSquare, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number') return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function SessionReportPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<CashSession | null>(null);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(() => {
        setIsLoading(true);
        if (!sessionId) {
            notFound();
            return;
        }

        const foundSession = getSessionById(sessionId);
        if (!foundSession) {
            notFound();
            return;
        }
        setSession(foundSession);

        const foundRestaurant = getRestaurants().find(r => r.id === foundSession.restaurantId);
        setRestaurant(foundRestaurant || null);
        
        setIsLoading(false);
    }, [sessionId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading || !session || !restaurant) {
        return (
            <main className="bg-gray-100 min-h-screen p-4 sm:p-8 flex justify-center">
                <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 space-y-4">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                     <Skeleton className="h-40 w-full" />
                </div>
            </main>
        )
    }

    const { startAmount, endAmount, sales, payouts, reinforcements, cancellations } = session;
    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
    const totalReinforcements = reinforcements.reduce((sum, r) => sum + r.amount, 0);
    
    // The expected amount in the drawer is based on the day's cash movement. The initial float is separate.
    const expectedCashInDrawer = sales.byMethod.Dinheiro + totalReinforcements - totalPayouts;
    const difference = typeof endAmount === 'number' ? endAmount - expectedCashInDrawer : 0;


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
                    .report-container {
                       width: 80mm;
                       padding: 2mm;
                       font-size: 9pt;
                       box-shadow: none;
                       border: none;
                    }
                }
            `}</style>
            <div className="report-container w-full max-w-sm bg-white shadow-lg rounded-lg p-6 relative font-mono">
                <Button onClick={handlePrint} variant="outline" size="icon" className="absolute top-6 right-6 no-print">
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Imprimir</span>
                </Button>

                <div className="text-center mb-4">
                    <h1 className="text-lg font-bold uppercase">Fechamento de Caixa</h1>
                    <p className="text-sm text-gray-700">{restaurant.name}</p>
                </div>
                
                <div className="space-y-3">
                    {/* Session Info */}
                    <div className="text-xs text-gray-600 border-b border-dashed pb-2">
                         <h2 className="font-semibold text-sm text-gray-800 mb-1">Informações</h2>
                        <div className="flex justify-between"><span>Aberto:</span><span>{format(new Date(session.openedAt), "dd/MM/yy HH:mm", { locale: ptBR })}</span></div>
                        <div className="flex justify-between"><span>Por:</span><span>{session.openedBy}</span></div>
                        <div className="flex justify-between"><span>Fechado:</span><span>{session.closedAt ? format(new Date(session.closedAt), "dd/MM/yy HH:mm", { locale: ptBR }) : 'N/A'}</span></div>
                        <div className="flex justify-between"><span>Por:</span><span>{session.closedBy}</span></div>
                        <div className="flex justify-between"><span>Fundo de Troco:</span><span>{formatCurrency(startAmount)}</span></div>
                    </div>

                    {/* Sales Summary */}
                    <div className="border-b border-dashed pb-2">
                        <h2 className="font-semibold text-sm mb-1">Vendas</h2>
                        <div className="space-y-1 text-xs">
                             <div className="flex justify-between"><span>(+) Dinheiro</span><span>{formatCurrency(sales.byMethod.Dinheiro)}</span></div>
                             <div className="flex justify-between"><span>(+) Crédito</span><span>{formatCurrency(sales.byMethod.Crédito)}</span></div>
                             <div className="flex justify-between"><span>(+) Débito</span><span>{formatCurrency(sales.byMethod.Débito)}</span></div>
                             <div className="flex justify-between"><span>(+) Pix</span><span>{formatCurrency(sales.byMethod.Pix)}</span></div>
                        </div>
                        <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed mt-1">
                            <span>Total de Vendas</span>
                            <span>{formatCurrency(sales.total)}</span>
                        </div>
                    </div>

                    {/* Reinforcements */}
                    {reinforcements.length > 0 && (
                        <div className="border-b border-dashed pb-2">
                            <h2 className="font-semibold text-sm mb-1 text-green-700">Reforços (Suprimentos)</h2>
                             <div className="space-y-1 text-xs">
                                {reinforcements.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span>(+) {item.reason}</span>
                                        <span>{formatCurrency(item.amount)}</span>
                                    </div>
                                ))}
                             </div>
                             <div className="flex justify-between font-bold text-sm pt-1 text-green-700 border-t border-dashed mt-1">
                                <span>Total de Reforços</span>
                                <span>{formatCurrency(totalReinforcements)}</span>
                            </div>
                        </div>
                    )}

                    {/* Payouts */}
                    {payouts.length > 0 && (
                        <div className="border-b border-dashed pb-2">
                            <h2 className="font-semibold text-sm mb-1 text-red-700">Saídas (Sangrias)</h2>
                             <div className="space-y-1 text-xs">
                                {payouts.map(payout => (
                                    <div key={payout.id} className="flex justify-between">
                                        <span>(-) {payout.reason}</span>
                                        <span>{formatCurrency(payout.amount)}</span>
                                    </div>
                                ))}
                             </div>
                             <div className="flex justify-between font-bold text-sm pt-1 text-red-700 border-t border-dashed mt-1">
                                <span>Total de Saídas</span>
                                <span>- {formatCurrency(totalPayouts)}</span>
                            </div>
                        </div>
                    )}

                    {/* Cancellations */}
                    {cancellations.count > 0 && (
                         <div className="border-b border-dashed pb-2">
                            <h2 className="font-semibold text-sm mb-1 text-orange-600">Cancelamentos</h2>
                             <div className="flex justify-between font-bold text-sm pt-1 text-orange-600">
                                <span>Itens Cancelados:</span>
                                <span>{cancellations.count}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Final Reconciliation */}
                    <div>
                         <h2 className="font-semibold text-sm mb-1">Conferência (Dinheiro)</h2>
                         <div className="space-y-1 text-xs border-b border-dashed pb-2">
                             <div className="flex justify-between"><span>(+) Vendas em Dinheiro</span><span>{formatCurrency(sales.byMethod.Dinheiro)}</span></div>
                             {totalReinforcements > 0 && <div className="flex justify-between text-green-600"><span>(+) Total de Reforços</span><span>{formatCurrency(totalReinforcements)}</span></div>}
                             {totalPayouts > 0 && <div className="flex justify-between text-red-600"><span>(-) Total de Saídas</span><span>- {formatCurrency(totalPayouts)}</span></div>}
                         </div>
                         <div className="flex justify-between font-bold text-sm pt-1">
                             <span>(=) Esperado em Caixa</span>
                             <span>{formatCurrency(expectedCashInDrawer)}</span>
                         </div>
                         <div className="flex justify-between font-bold text-sm pt-1">
                             <span>(>) Contado na Gaveta</span>
                             <span>{formatCurrency(endAmount)}</span>
                         </div>
                         <Separator className="my-1"/>
                         <div className={cn("flex justify-between font-bold text-base p-1 rounded-md", difference === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                             <span>{difference > 0 ? "SOBRA:" : difference < 0 ? "FALTA:" : "SALDO CORRETO"}</span>
                             <span>{formatCurrency(difference)}</span>
                         </div>
                    </div>
                </div>
                
                 <div className="mt-6 text-center text-xs text-gray-400">
                    <p>Gerado por Chama em {format(new Date(), "dd/MM/yy HH:mm", { locale: ptBR })}</p>
                </div>
            </div>
        </main>
    );
}
