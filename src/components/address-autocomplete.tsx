
"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import type { Restaurant } from "@/lib/restaurants-data";

interface AddressAutocompleteProps {
    form: UseFormReturn<any>;
    cepFieldName: "cep";
    addressFieldName: keyof Restaurant;
    locationFieldName: keyof Restaurant;
}

export function AddressAutocomplete({ form, cepFieldName, addressFieldName, locationFieldName }: AddressAutocompleteProps) {
    const { toast } = useToast();
    const [isFetching, setIsFetching] = useState(false);

    const handleFetchCep = async () => {
        const cepValue = form.getValues(cepFieldName)?.replace(/\D/g, '');
        if (!cepValue || cepValue.length !== 8) {
            toast({ title: "CEP inválido", description: "Por favor, digite um CEP com 8 números.", variant: "destructive" });
            return;
        }

        setIsFetching(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
            if (!response.ok) throw new Error("CEP não encontrado.");
            
            const data = await response.json();
            if (data.erro) throw new Error("CEP não encontrado.");

            form.setValue(addressFieldName as string, `${data.logradouro}, ${data.bairro}`, { shouldValidate: true });
            form.setValue(locationFieldName as string, `${data.localidade}, ${data.uf}`, { shouldValidate: true });
            toast({ title: "Endereço encontrado!", description: "Os campos de endereço foram preenchidos." });

        } catch (error) {
            console.error("CEP fetch error:", error);
            toast({ title: "Erro ao buscar CEP", description: "Não foi possível encontrar o endereço. Verifique o CEP e tente novamente.", variant: "destructive"});
        } finally {
            setIsFetching(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name={cepFieldName}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input placeholder="Digite o CEP" {...field} />
                            </FormControl>
                            <Button type="button" onClick={handleFetchCep} disabled={isFetching}>
                               {isFetching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4" />}
                               <span className="sr-only">Buscar CEP</span>
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={addressFieldName as string}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl>
                            <Input placeholder="Preenchido automaticamente após buscar CEP" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={locationFieldName as string}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Localização (Bairro, Cidade)</FormLabel>
                        <FormControl>
                            <Input placeholder="Preenchido automaticamente após buscar CEP" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
