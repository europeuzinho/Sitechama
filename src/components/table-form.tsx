

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Table as TableData } from "@/lib/restaurants-data";
import { PlusCircle, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

const tableFormSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(1, "O número da mesa é obrigatório."),
  capacity: z.coerce.number().min(1, "A capacidade deve ser de pelo menos 1."),
  priority: z.coerce.number().min(1, "A prioridade deve ser de pelo menos 1."),
  combinableWith: z.array(z.string()).optional(),
  status: z.enum(['available', 'occupied']).default('available'),
});

type TableFormData = z.infer<typeof tableFormSchema>;

interface TableFormProps {
  onSubmit: (data: TableFormData) => void;
  table?: TableData | null;
  allTables: TableData[];
}

const defaultValues: Omit<TableData, 'id'> = {
  number: "",
  capacity: 2,
  priority: 10,
  combinableWith: [],
  status: 'available',
};

export function TableForm({ onSubmit, table, allTables }: TableFormProps) {
  const form = useForm<TableFormData>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: table ? { ...table, combinableWith: table.combinableWith || [] } : defaultValues,
  });

  useEffect(() => {
    form.reset(table ? { ...table, combinableWith: table.combinableWith || [] } : defaultValues);
  }, [table, form]);
  
  const otherTables = allTables.filter(t => t.id !== table?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número/Nome da Mesa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 5, Varanda 2..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidade (Pessoas)</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade de Uso</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="combinableWith"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Mesas Combináveis (Opcional)</FormLabel>
                     <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between h-auto min-h-10",
                                        !field.value?.length && "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex gap-1 flex-wrap">
                                        {field.value && field.value.length > 0 ? (
                                            field.value.map(tableId => (
                                                <Badge key={tableId} variant="secondary">
                                                    {allTables.find(t => t.id === tableId)?.number || 'Desconhecida'}
                                                </Badge>
                                            ))
                                        ) : "Selecione as mesas..."}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar mesa..." />
                                <CommandList>
                                  <CommandEmpty>Nenhuma mesa encontrada.</CommandEmpty>
                                  <CommandGroup>
                                      {otherTables.map((t) => (
                                          <CommandItem
                                              value={t.number}
                                              key={t.id}
                                              onSelect={() => {
                                                  const selectedValues = field.value || [];
                                                  const newValue = selectedValues.includes(t.id)
                                                      ? selectedValues.filter(id => id !== t.id)
                                                      : [...selectedValues, t.id];
                                                  form.setValue("combinableWith", newValue);
                                              }}
                                          >
                                              <Check
                                                  className={cn(
                                                      "mr-2 h-4 w-4",
                                                      field.value?.includes(t.id) ? "opacity-100" : "opacity-0"
                                                  )}
                                              />
                                              {t.number} (Cap: {t.capacity})
                                          </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          {table ? "Salvar Alterações" : "Adicionar Mesa"}
        </Button>
      </form>
    </Form>
  );
}
