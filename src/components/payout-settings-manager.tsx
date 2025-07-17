
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

import { Restaurant, PayoutSettings, updateRestaurant } from "@/lib/restaurants-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Banknote, Landmark } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const payoutSettingsSchema = z.object({
  cnpj: z.string().min(14, { message: "CNPJ deve ter 14 dígitos" }).max(18, { message: "CNPJ inválido" }),
  bankName: z.string().min(2, { message: "Nome do banco é obrigatório" }),
  agency: z.string().min(4, { message: "Agência é obrigatória" }),
  accountNumber: z.string().min(5, { message: "Número da conta é obrigatório" }),
  accountType: z.enum(['corrente', 'poupanca'], { required_error: "Selecione o tipo da conta" }),
});

type PayoutSettingsFormData = z.infer<typeof payoutSettingsSchema>;

interface PayoutSettingsManagerProps {
  restaurant: Restaurant;
  onUpdate: (updatedData: Partial<Restaurant>) => void;
}

export function PayoutSettingsManager({ restaurant, onUpdate }: PayoutSettingsManagerProps) {
  const { toast } = useToast();

  const form = useForm<PayoutSettingsFormData>({
    resolver: zodResolver(payoutSettingsSchema),
    defaultValues: {
        cnpj: restaurant.payoutSettings?.cnpj || "",
        bankName: restaurant.payoutSettings?.bankName || "",
        agency: restaurant.payoutSettings?.agency || "",
        accountNumber: restaurant.payoutSettings?.accountNumber || "",
        accountType: restaurant.payoutSettings?.accountType || "corrente",
    }
  });
  
  useEffect(() => {
    form.reset(restaurant.payoutSettings);
  }, [restaurant.payoutSettings, form]);

  const onSubmit = (data: PayoutSettingsFormData) => {
    onUpdate({ payoutSettings: data });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl font-bold flex items-center gap-2">
            <Landmark />
            Informações Financeiras
        </CardTitle>
        <CardDescription>
          Preencha os dados da sua empresa para futuros repasses. Estas informações são confidenciais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0001-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Banco</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Banco do Brasil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="agency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agência</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 1234-5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta Corrente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 12345-6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Conta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="corrente">Corrente</SelectItem>
                                <SelectItem value="poupanca">Poupança</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Informações Financeiras
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
