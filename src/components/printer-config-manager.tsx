
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

import { Restaurant, PrinterSettings } from "@/lib/restaurants-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";

const printerSettingsSchema = z.object({
  cozinha: z.string().min(1, { message: "O nome da impressora é obrigatório." }),
  copa: z.string().min(1, { message: "O nome da impressora é obrigatório." }),
  caixa: z.string().min(1, { message: "O nome da impressora é obrigatório." }),
});

type PrinterSettingsFormData = z.infer<typeof printerSettingsSchema>;

interface PrinterSettingsManagerProps {
  restaurant: Restaurant;
  onUpdate: (updatedData: Partial<Restaurant>) => void;
}

export function PrinterSettingsManager({ restaurant, onUpdate }: PrinterSettingsManagerProps) {
  const { toast } = useToast();

  const form = useForm<PrinterSettingsFormData>({
    resolver: zodResolver(printerSettingsSchema),
    defaultValues: {
      cozinha: restaurant.printerSettings?.cozinha || "",
      copa: restaurant.printerSettings?.copa || "",
      caixa: restaurant.printerSettings?.caixa || "",
    }
  });

  useEffect(() => {
    form.reset(restaurant.printerSettings || { cozinha: '', copa: '', caixa: '' });
  }, [restaurant.printerSettings, form]);

  const onSubmit = (data: PrinterSettingsFormData) => {
    onUpdate({ printerSettings: data });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl font-bold flex items-center gap-2">
            <Printer />
            Configuração de Impressoras (Simulado)
        </CardTitle>
        <CardDescription>
          Defina apelidos para as impressoras de cada departamento. Estes nomes serão usados para identificar as janelas de impressão corretas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="cozinha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impressora da Cozinha</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: EPSON TM-T20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="copa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impressora da Copa/Bar</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: BEMATECH MP-4200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="caixa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impressora do Caixa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: DARUMA DR800" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Configurações de Impressão
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
