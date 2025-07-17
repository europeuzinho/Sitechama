

"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { getUserPoints, removeUserPoints, findUserByShortCode } from '@/lib/points-store';
import { Loader2, Search, Trophy } from 'lucide-react';
import type { Restaurant } from '@/lib/restaurants-data';

interface PointRedemptionManagerProps {
    restaurant: Restaurant;
}

export function PointRedemptionManager({ restaurant }: PointRedemptionManagerProps) {
    const { toast } = useToast();
    const [shortCode, setShortCode] = useState('');
    const [foundUser, setFoundUser] = useState<{ id: string; points: number; } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [redeemAmount, setRedeemAmount] = useState<number>(0);
    const [redeemReason, setRedeemReason] = useState('');
    
    const handleCheckPoints = () => {
        if (!shortCode) {
            toast({ title: "Código necessário", description: "Por favor, insira o código do cliente.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const user = findUserByShortCode(shortCode.toUpperCase());
        if (user) {
            setFoundUser({ id: user.userId, points: user.total });
        } else {
            toast({ title: "Cliente não encontrado", description: "Nenhum cliente encontrado com este código.", variant: "destructive" });
            setFoundUser(null);
        }
        setIsLoading(false);
    };

    const handleRedeemPoints = () => {
        if (!foundUser || redeemAmount <= 0 || !redeemReason) {
             toast({ title: "Campos Inválidos", description: "Preencha a quantidade de pontos e o motivo para o resgate.", variant: "destructive" });
             return;
        }
        if (foundUser.points < redeemAmount) {
            toast({ title: "Pontos Insuficientes", description: "O cliente não tem pontos suficientes para este resgate.", variant: "destructive" });
            return;
        }

        removeUserPoints(foundUser.id, redeemAmount, `${redeemReason} em ${restaurant.name}`);
        toast({ title: "Pontos Resgatados!", description: `${redeemAmount} pontos foram deduzidos do saldo do cliente.`});

        // Update local state and reset form
        setFoundUser(prev => prev ? { ...prev, points: prev.points - redeemAmount } : null);
        setRedeemAmount(0);
        setRedeemReason('');
    };
    
    const resetSearch = () => {
        setShortCode('');
        setFoundUser(null);
        setRedeemAmount(0);
        setRedeemReason('');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl font-bold">Resgate de Pontos de Fidelidade</CardTitle>
                <CardDescription>Consulte o saldo de um cliente e resgate pontos em troca de produtos ou descontos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold text-lg">1. Consultar Saldo do Cliente</h4>
                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Digite o Código do Cliente (6 dígitos)"
                            maxLength={6}
                            value={shortCode}
                            onChange={(e) => setShortCode(e.target.value)}
                            disabled={!!foundUser}
                        />
                        <Button onClick={handleCheckPoints} disabled={isLoading || !!foundUser}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {foundUser && (
                    <div className="p-4 border rounded-lg space-y-4 bg-secondary animate-in fade-in-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-lg">2. Resgatar Pontos</h4>
                                <p className="text-sm text-muted-foreground break-all">Cliente: {foundUser.id.substring(0, 6).toUpperCase()}</p>
                            </div>
                             <div className="text-right">
                                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                    <Trophy className="h-6 w-6"/>
                                    {foundUser.points}
                                </div>
                             </div>
                        </div>

                         <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                type="number"
                                placeholder="Pontos a resgatar"
                                value={redeemAmount || ''}
                                onChange={(e) => setRedeemAmount(Number(e.target.value))}
                            />
                             <Input
                                placeholder="Motivo do resgate (Ex: Sobremesa grátis)"
                                value={redeemReason}
                                onChange={(e) => setRedeemReason(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleRedeemPoints} disabled={redeemAmount <= 0 || !redeemReason}>Resgatar Pontos</Button>
                            <Button variant="ghost" onClick={resetSearch}>Buscar Outro Cliente</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
