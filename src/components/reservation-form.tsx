
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { addReservation } from "@/lib/reservation-store";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { addUserPoints } from "@/lib/points-store";
import { getRestaurants, Restaurant } from '@/lib/restaurants-data';

const USER_PHONE_STORAGE_KEY = 'user-phone-numbers';

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "O nome completo deve ter pelo menos 2 caracteres.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Por favor, insira um número de telefone válido.",
  }),
  numberOfPeople: z.coerce.number().min(1, {
    message: "Você deve reservar para pelo menos 1 pessoa.",
  }),
  date: z.date({
    required_error: "A data para a reserva é obrigatória.",
  }),
  time: z.string({
    required_error: "A hora para a reserva é obrigatória.",
  }),
  observations: z.string().optional(),
});

interface ReservationFormProps {
  selectedDate?: Date;
  restaurantId?: string;
  onSuccess?: () => void;
  successTitle?: string;
  successDescription?: string;
}

// Helper to get all phone numbers from localStorage
const getAllPhoneNumbers = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const stored = window.localStorage.getItem(USER_PHONE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

export function ReservationForm({ selectedDate, restaurantId, onSuccess, successTitle, successDescription }: ReservationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      numberOfPeople: 1,
      date: selectedDate,
      observations: "",
    },
  });

  useEffect(() => {
    if (restaurantId) {
      const allRestaurants = getRestaurants();
      setRestaurant(allRestaurants.find(r => r.id === restaurantId) || null);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (selectedDate) {
      form.setValue("date", selectedDate);
    }
  }, [selectedDate, form]);
  
  useEffect(() => {
    if (user) {
      // Pre-fill name from auth profile
      if (user.displayName && !form.getValues('fullName')) {
        form.setValue("fullName", user.displayName);
      }
      // Pre-fill phone from localStorage
      if (user.email) {
        const allNumbers = getAllPhoneNumbers();
        const userPhone = allNumbers[user.email];
        if (userPhone && !form.getValues('phoneNumber')) {
          form.setValue("phoneNumber", userPhone);
        }
      }
    }
  }, [user, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!restaurantId || !user || !user.email || !user.uid) {
       toast({
        title: "Erro na Reserva",
        description: "Você precisa estar logado para fazer uma reserva.",
        variant: "destructive"
       });
       return;
    }
    
    const newReservation = {
      restaurantId: restaurantId,
      userId: user.uid,
      userEmail: user?.email,
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      numberOfPeople: values.numberOfPeople,
      date: format(values.date, "yyyy-MM-dd"),
      time: values.time,
      status: "Confirmado" as const,
      observations: values.observations,
    };
    addReservation(newReservation);

    const restaurantName = getRestaurants().find(r => r.id === restaurantId)?.name || 'restaurante';
    addUserPoints(user.uid, 1, `Reserva em ${restaurantName}`);
    
    toast({
      title: successTitle || "Reserva Confirmada!",
      description: successDescription || "Sua mesa foi reservada com sucesso. Você ganhou 1 ponto!",
    });
    
    form.reset({
      fullName: user?.displayName || "",
      phoneNumber: "",
      numberOfPeople: 1,
      date: undefined,
      time: undefined,
      observations: "",
    });
    
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(`/profile`);
    }
  }

  const blockedDates = (restaurant?.blockedDates || []).map(dateStr => parse(dateStr, 'yyyy-MM-dd', new Date()));

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Pessoas</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={[
                          ...blockedDates,
                          (date) => date < new Date(new Date().setHours(0,0,0,0))
                        ]}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="18:00">18:00</SelectItem>
                      <SelectItem value="18:30">18:30</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                      <SelectItem value="19:30">19:30</SelectItem>
                      <SelectItem value="20:00">20:00</SelectItem>
                      <SelectItem value="20:30">20:30</SelectItem>
                      <SelectItem value="21:00">21:00</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Aniversário, alergia a glúten, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg">
              Confirmar Reserva
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
