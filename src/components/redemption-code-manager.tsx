
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Ticket, PlusCircle, Copy } from "lucide-react";
import { RedemptionCode, getCodesByRestaurant, generateCodesForRestaurant } from "@/lib/redemption-codes-store";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RedemptionCodeManagerProps {
    restaurantId: string;
}

export function RedemptionCodeManager({ restaurantId }: RedemptionCodeManagerProps) {
    const { toast } = useToast();
    const [codes, setCodes] = useState<RedemptionCode[]>([]);

    const loadCodes = () => {
        setCodes(getCodesByRestaurant(restaurantId));
    };

    useEffect(() => {
        loadCodes();
        window.addEventListener('codesChanged', loadCodes);
        return () => {
            window.removeEventListener('codesChanged', loadCodes);
        };
    }, [restaurantId]);

    const handleGenerateCodes = () => {
        generateCodesForRestaurant(restaurantId, 5); // Generate 5 new codes
        toast({
            title: "Códigos Gerados!",
            description: "5 novos códigos de resgate foram criados para seus clientes.",
        });
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Código Copiado",
            description: `${code} foi copiado para a área de transferência.`,
        });
    };

    const sortedCodes = codes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-3xl font-bold flex items-center gap-2">
                        <Ticket />
                        Gerenciador de Códigos
                    </CardTitle>
                    <CardDescription>
                        Gere e acompanhe os códigos de resgate para seus clientes.
                    </CardDescription>
                </div>
                <Button onClick={handleGenerateCodes}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Gerar 5 Códigos
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Utilizado por</TableHead>
                                <TableHead>Data de Uso</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedCodes.length > 0 ? (
                                sortedCodes.map((code) => (
                                    <TableRow key={code.code}>
                                        <TableCell className="font-mono">
                                            <div className="flex items-center gap-2">
                                                {code.code}
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyCode(code.code)}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={code.isUsed ? "secondary" : "default"} className={!code.isUsed ? 'bg-green-600' : ''}>
                                                {code.isUsed ? 'Utilizado' : 'Disponível'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{code.usedBy || '-'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {code.usedAt ? format(new Date(code.usedAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        Nenhum código gerado ainda. Clique no botão acima para criar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    Instrução: Gere os códigos aqui e integre com seu sistema de Ponto de Venda (PDV) para imprimi-los automaticamente na nota fiscal do cliente.
                </p>
            </CardContent>
        </Card>
    );
}
