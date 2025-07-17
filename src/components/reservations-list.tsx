
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Cake, Mail, Building, User, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Reservation, deleteReservation } from "@/lib/reservation-store";
import { useToast } from "@/hooks/use-toast";
import { getRestaurants, Restaurant } from "@/lib/restaurants-data";
import { notifyCakeOrder, NotifyCakeOrderOutput } from "@/ai/flows/notify-cake-order-flow";

interface ReservationsListProps {
  reservations: Reservation[];
}

const CakeNotificationViewer = ({ reservation }: { reservation: Reservation }) => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [notifications, setNotifications] = useState<NotifyCakeOrderOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFetchNotifications = async () => {
        if (!restaurant) return;
        setIsLoading(true);
        try {
            const fetchedNotifications = await notifyCakeOrder({
                restaurantName: restaurant.name,
                restaurantAddress: restaurant.address,
                managerEmail: restaurant.ownerEmail,
                bakeryEmail: 'pricethegames@gmail.com',
                reservationDate: format(parseISO(reservation.date), "dd/MM/yyyy"),
                reservationTime: reservation.time,
                reservationName: reservation.fullName,
            });
            setNotifications(fetchedNotifications);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const foundRestaurant = getRestaurants().find(r => r.id === reservation.restaurantId);
        setRestaurant(foundRestaurant || null);
    }, [reservation.restaurantId]);

    return (
        <Dialog onOpenChange={(open) => { if (open && !notifications) handleFetchNotifications() }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Ver Notificações
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Simulação de Notificações de Bolo</DialogTitle>
                    <DialogDescription>
                        Isto é o que a IA gerou para a encomenda da reserva de {reservation.fullName}. Nenhum e-mail real foi enviado.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : notifications ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 border rounded-lg bg-background">
                                <h4 className="font-semibold text-lg flex items-center gap-2 mb-2"><Building /> Para a Panificadora</h4>
                                <pre className="text-sm whitespace-pre-wrap font-sans bg-muted p-2 rounded-md overflow-x-auto">{notifications.bakeryNotification}</pre>
                            </div>
                            <div className="p-4 border rounded-lg bg-background">
                                <h4 className="font-semibold text-lg flex items-center gap-2 mb-2"><User /> Para o Gerente</h4>
                                <pre className="text-sm whitespace-pre-wrap font-sans bg-muted p-2 rounded-md overflow-x-auto">{notifications.managerNotification}</pre>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">Não foi possível carregar as notificações.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export function ReservationsList({ reservations }: ReservationsListProps) {
  const { toast } = useToast();

  const handleDelete = (restaurantId: string, id: string) => {
    deleteReservation(restaurantId, id);
    toast({
      title: "Reserva Excluída",
      description: "A reserva foi removida com sucesso.",
    });
  };

  if (reservations.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-12">
          <p>Nenhuma reserva encontrada para a data selecionada.</p>
        </div>
    )
  }

  const getBadgeVariant = (status: Reservation["status"]) => {
    switch(status) {
      case "Confirmado":
        return "default";
      case "Pendente":
        return "secondary";
      case "Cancelado":
        return "destructive";
      case "Checked-in":
        return "default";
       case "No-show":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getBadgeClass = (status: Reservation["status"]) => {
      switch(status) {
          case 'Confirmado':
              return 'bg-blue-500 text-primary-foreground';
          case 'Checked-in':
              return 'bg-green-600 text-primary-foreground';
          default:
              return '';
      }
  }

  return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hora</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-center">Convidados</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.sort((a, b) => a.time.localeCompare(b.time))
            .map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-semibold">{reservation.time}</TableCell>
                <TableCell className="font-medium">
                  {reservation.fullName}
                  {reservation.hasCakeOrder && <Cake className="inline-block ml-2 h-4 w-4 text-pink-500" />}
                </TableCell>
                <TableCell>{reservation.phoneNumber}</TableCell>
                <TableCell className="text-center">{reservation.numberOfPeople}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">{reservation.observations || "-"}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={getBadgeVariant(reservation.status)} 
                    className={getBadgeClass(reservation.status)}
                  >
                    {reservation.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {reservation.hasCakeOrder && <CakeNotificationViewer reservation={reservation} />}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Excluir reserva</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente a reserva de
                          <span className="font-semibold"> {reservation.fullName}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(reservation.restaurantId, reservation.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
  );
}
