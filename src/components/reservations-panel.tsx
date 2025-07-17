
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Trash2, UserX, Check, Clock, Users } from "lucide-react";
import { format } from "date-fns";
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
} from "@/components/ui/alert-dialog";
import { Reservation, getReservationsForDate, updateReservationStatus, deleteReservation } from "@/lib/reservation-store";
import { getRestaurants, Restaurant, Table as TableData } from "@/lib/restaurants-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReservationsPanelProps {
  restaurantId: string;
}

export function ReservationsPanel({ restaurantId }: ReservationsPanelProps) {
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [today] = useState<Date>(new Date());

  const loadData = useCallback(() => {
    if (!restaurantId) return;
    const allRestaurants = getRestaurants();
    const currentRestaurant = allRestaurants.find(r => r.id === restaurantId);
    
    if (currentRestaurant) {
      setRestaurant(currentRestaurant);
      const todaysReservations = getReservationsForDate(restaurantId, currentRestaurant.tables || [], today);
      setReservations(todaysReservations);
    }
  }, [restaurantId, today]);

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('reservationsChanged', handleDataChange);
    return () => {
        window.removeEventListener('reservationsChanged', handleDataChange);
    };
  }, [loadData]);
  
  const handleUpdateStatus = (id: string, newStatus: Reservation['status']) => {
    updateReservationStatus(restaurantId, id, newStatus);
    toast({
      title: "Status da Reserva Atualizado",
      description: `A reserva foi marcada como "${newStatus}".`
    });
  };

  const handleDelete = (id: string) => {
    deleteReservation(restaurantId, id);
    toast({
      title: "Reserva Excluída",
      description: "A reserva foi removida com sucesso.",
    });
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case "Checked-in":
        return <Badge className="bg-green-600 hover:bg-green-700">Check-in</Badge>;
      case "No-show":
        return <Badge variant="destructive">Não Compareceu</Badge>;
      case "Cancelado":
        return <Badge variant="secondary" className="bg-zinc-700 text-zinc-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Aguardando</Badge>;
    }
  };

  const reservationsToShow = reservations
    .filter(r => r.status === 'Confirmado' || r.status === 'Checked-in' || r.status === 'No-show')
    .sort((a,b) => a.time.localeCompare(b.time));

  if (!restaurant) {
      return <div>Carregando...</div>
  }

  return (
    <Card>
      <CardHeader>
          <CardTitle className="font-headline text-3xl font-bold">Reservas do Dia</CardTitle>
          <CardDescription>Lista de reservas confirmadas para hoje, com sugestão de mesas.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]"><Clock className="inline-block h-4 w-4 mr-1"/> Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="w-[120px] text-center"><Users className="inline-block h-4 w-4 mr-1"/> Pessoas</TableHead>
                <TableHead className="text-center">Mesa Sugerida</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-center w-[150px]">Status</TableHead>
                <TableHead className="text-right w-[240px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservationsToShow.length > 0 ? (
                reservationsToShow.map(res => (
                  <TableRow key={res.id} className={cn(res.status !== 'Confirmado' && 'bg-muted/50', res.status === 'Checked-in' && 'bg-green-500/10 hover:bg-green-500/20')}>
                    <TableCell className="font-mono font-semibold text-lg">{res.time}</TableCell>
                    <TableCell>
                      <div className="font-medium">{res.fullName}</div>
                      <div className="text-xs text-muted-foreground">{res.phoneNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">{res.numberOfPeople}</TableCell>
                    <TableCell className="text-center font-bold text-lg">
                      {res.assignedTable || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {res.observations || 'Nenhuma'}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(res.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {res.status === 'Confirmado' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateStatus(res.id, 'Checked-in')} className="bg-green-600 hover:bg-green-700">
                              <Check className="mr-2 h-4 w-4"/>
                              Check-in
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <UserX className="mr-2 h-4 w-4"/>
                                  No-show
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Marcar como "Não Compareceu"?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Isso irá atualizar o status da reserva e remover 1 ponto de fidelidade do usuário. Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleUpdateStatus(res.id, 'No-show')}>
                                    Confirmar Ausência
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir reserva</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Reserva?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação é permanente e não pode ser desfeita. Tem certeza que quer excluir a reserva de <span className="font-semibold">{res.fullName}</span>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(res.id)}>Confirmar Exclusão</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    Nenhuma reserva para hoje.
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
