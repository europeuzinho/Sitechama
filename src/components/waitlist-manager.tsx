
"use client";

import { useState, useEffect, useCallback } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, Bell, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WaitlistItem, addToWaitlist, getWaitlistByRestaurant, removeFromWaitlist, updateWaitlistStatus } from "@/lib/waitlist-store";

interface WaitlistManagerProps {
  restaurantId: string;
}

export function WaitlistManager({ restaurantId }: WaitlistManagerProps) {
  const { toast } = useToast();
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(1);

  const loadWaitlist = useCallback(() => {
    setWaitlist(getWaitlistByRestaurant(restaurantId));
  }, [restaurantId]);

  useEffect(() => {
    loadWaitlist();
    const handleDataChange = () => loadWaitlist();
    window.addEventListener('waitlistChanged', handleDataChange);
    return () => {
        window.removeEventListener('waitlistChanged', handleDataChange);
    };
  }, [loadWaitlist]);

  const handleAddToWaitlist = () => {
    if (!name || !phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são necessários.",
        variant: "destructive",
      });
      return;
    }
    addToWaitlist({
      restaurantId,
      name,
      phone,
      partySize,
      status: "Aguardando",
    });
    setName("");
    setPhone("");
    setPartySize(1);
    toast({
      title: "Cliente adicionado",
      description: `${name} está na fila de espera.`,
    });
  };

  const handleUpdateStatus = (id: string, status: WaitlistItem['status']) => {
    updateWaitlistStatus(restaurantId, id, status);
    toast({
      title: "Status atualizado",
      description: `O cliente foi marcado como '${status}'.`,
    });
  };
  
  const handleRemove = (id: string) => {
    removeFromWaitlist(restaurantId, id);
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido da fila de espera.",
    });
  }

  const getBadgeVariant = (status: WaitlistItem['status']) => {
    switch (status) {
      case "Aguardando":
        return "secondary";
      case "Chamado":
        return "default";
      case "Cancelado":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl font-bold">
          Fila de Espera
        </CardTitle>
        <CardDescription>
          Gerencie clientes que aguardam por uma mesa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg space-y-4">
            <h4 className="font-semibold text-lg">Adicionar à Fila</h4>
            <div className="grid md:grid-cols-3 gap-4">
                <Input 
                    placeholder="Nome do Cliente" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Input 
                    placeholder="Telefone" 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <Input 
                    placeholder="Nº Pessoas" 
                    type="number" 
                    min="1"
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value, 10))}
                />
            </div>
            <Button onClick={handleAddToWaitlist}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Cliente
            </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-center">Pessoas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tempo de Espera</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waitlist.filter(item => item.status === 'Aguardando' || item.status === 'Chamado').length > 0 ? (
                waitlist
                  .filter(item => item.status === 'Aguardando' || item.status === 'Chamado')
                  .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.phone}</div>
                      </TableCell>
                      <TableCell className="text-center">{item.partySize}</TableCell>
                      <TableCell>
                        <Badge 
                            variant={getBadgeVariant(item.status)}
                            className={item.status === 'Chamado' ? 'bg-green-600' : ''}
                        >
                            {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { locale: ptBR, addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {item.status === 'Aguardando' && (
                            <Button variant="outline" size="icon" onClick={() => handleUpdateStatus(item.id, 'Chamado')}>
                                <Bell className="h-4 w-4" />
                                <span className="sr-only">Chamar cliente</span>
                            </Button>
                        )}
                        {item.status === 'Chamado' && (
                           <Button variant="ghost" size="icon" disabled>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="sr-only">Cliente já foi chamado</span>
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Remover</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    A fila de espera está vazia.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
