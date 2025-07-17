

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, notFound, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Reinforcement, getReinforcementById } from "@/lib/cash-session-store";
import { Restaurant, getRestaurants } from "@/lib/restaurants-data";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function ReinforcementReceiptPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const reinforcementId = params.reinforcementId as string;
    const restaurantId = searchParams.get("restaurantId");

    const [reinforcement, setReinforcement] = useState<Reinforcement | null>(null);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(() => {
        setIsLoading(true);
        if (!reinforcementId || !restaurantId) {
            notFound();
            return;
        }

        const foundReinforcement = getReinforcementById(reinforcementId);
        if (!foundReinforcement) {
            notFound();
            return;
        }
        setReinforcement(foundReinforcement);

        const foundRestaurant = getRestaurants().find(r => r.id === restaurantId);
        if(foundRestaurant) {
            setRestaurant(foundRestaurant);
        } else {
            notFound();
        }

        setIsLoading(false);
    }, [reinforcementId, restaurantId]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    if (isLoading || !reinforcement || !restaurant) {
        return (
            <main className="bg-gray-100 min-h-screen p-4 sm:p-8 flex justify-center">
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-4">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </main>
        )
    }

    const handlePrint = () => {
        window.print();
    };

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
                    .receipt-container {
                       width: 80mm;
                       padding: 2mm;
                       font-size: 10pt;
                       box-shadow: none;
                       border: none;
                    }
                }
            `}</style>
            <div className="receipt-container w-full max-w-sm bg-white shadow-lg rounded-lg p-6 relative font-mono">
                <Button onClick={handlePrint} variant="outline" size="icon" className="absolute top-6 right-6 no-print">
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Imprimir</span>
                </Button>

                <div className="text-center mb-6">
                    <h1 className="text-lg font-bold uppercase">Recibo de Reforço de Caixa</h1>
                    <p className="text-sm">{restaurant.name}</p>
                </div>

                <div className="space-y-4 text-sm">
                    <p>
                        Este documento comprova a entrada no caixa do restaurante <strong className="uppercase">{restaurant.name}</strong> da quantia de <strong className="uppercase">{formatCurrency(reinforcement.amount)}</strong>.
                    </p>

                    <div className="p-2 border-2 border-dashed my-2 text-center">
                        <p className="text-xs uppercase text-gray-500">MOTIVO</p>
                        <p className="font-bold text-base uppercase">{reinforcement.reason}</p>
                    </div>

                    <p>
                        O valor foi adicionado na data de {format(new Date(reinforcement.timestamp), "dd/MM/yyyy", { locale: ptBR })} pelo operador <strong className="uppercase">{reinforcement.addedBy}</strong>.
                    </p>
                </div>


                <div className="mt-16 text-center text-xs">
                    <div className="w-4/5 border-t border-black mx-auto"></div>
                    <p className="mt-1">Assinatura do Supervisor</p>
                </div>

                 <div className="mt-8 text-center text-xs text-gray-400">
                    <p>Gerado por Chama em {format(new Date(), "dd/MM/yy HH:mm", { locale: ptBR })}</p>
                </div>
            </div>
        </main>
    )
}
