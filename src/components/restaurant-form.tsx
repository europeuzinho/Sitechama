

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addRestaurant, updateRestaurant, Restaurant, NewRestaurant } from "@/lib/restaurants-data";
import { PlusCircle, Trash2, Sparkles, Loader2, Search } from "lucide-react";
import { Separator } from "./ui/separator";
import { useEffect, useState } from "react";
import { generateRestaurantDescription } from "@/ai/flows/generate-restaurant-description-flow";
import { useAuth } from "@/hooks/use-auth";


const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  cep: z.string().optional(),
  location: z.string().min(2, "A localização é obrigatória."),
  logo: z.string().url({ message: "Por favor, insira uma URL de logo válida." }).optional().or(z.literal('')),
  image: z.string().url({ message: "Por favor, insira uma URL de imagem principal válida." }),
  ownerEmail: z.string().email("Por favor, insira um e-mail de proprietário válido."),
  plan: z.enum(['Insights', 'Digital', 'Completo'], { required_error: "Selecione um plano." }),
  pin: z.string().length(4, "O PIN deve ter exatamente 4 dígitos.").regex(/^\d+$/, "O PIN deve conter apenas números."),
  category: z.enum(['italiana', 'japonesa', 'francesa', 'brasileira', 'bar', 'lanchonete', 'asiatica', 'arabe', 'doceria', 'saudavel', 'carnes'], { required_error: "Selecione uma categoria." }),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  address: z.string().min(5, "O endereço é obrigatório."),
  phone: z.string().min(8, "O telefone é obrigatório."),
  sac: z.string().email("O SAC deve ser um e-mail válido."),
  galleryImages: z.array(z.object({
    url: z.string().url({ message: "Por favor, insira uma URL válida para a imagem da galeria." }),
    hint: z.string(),
  })).min(1, "Adicione pelo menos uma imagem na galeria."),
});

type RestaurantFormData = z.infer<typeof formSchema>;

interface RestaurantFormProps {
    onFormSubmit: () => void;
    restaurant?: Partial<Restaurant> | null;
}

const defaultValues: Omit<Restaurant, 'id' | 'reviews' | 'createdAt' | 'tables' | 'employees' | 'blockedDates' | 'cakeOrderSettings' | 'payoutSettings'> = {
  name: "",
  location: "",
  logo: "",
  image: "",
  ownerEmail: "",
  plan: undefined,
  pin: "",
  category: undefined,
  description: "",
  address: "",
  phone: "",
  sac: "",
  galleryImages: [{ url: "", hint: "" }],
};

export function RestaurantForm({ onFormSubmit, restaurant }: RestaurantFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  
  const isNewRestaurantOnboarding = !restaurant?.id;

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        ...defaultValues,
        cep: "",
        ...(restaurant ? { ...restaurant } : {}),
        ownerEmail: isNewRestaurantOnboarding ? user?.email || "" : restaurant?.ownerEmail || "",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "galleryImages",
  });

  useEffect(() => {
    form.reset({
        ...defaultValues,
        ...restaurant,
        cep: restaurant?.payoutSettings?.cnpj || "",
        ownerEmail: isNewRestaurantOnboarding ? user?.email || "" : restaurant?.ownerEmail || "",
    });
  }, [restaurant, user, isNewRestaurantOnboarding, form]);


  const handleFetchCep = async () => {
    const cep = form.getValues("cep")?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) {
        toast({ title: "CEP inválido", description: "Por favor, digite um CEP com 8 números.", variant: "destructive" });
        return;
    }
    
    setIsFetchingCep(true);
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error("CEP não encontrado.");
        
        const data = await response.json();
        if (data.erro) throw new Error("CEP não encontrado.");

        form.setValue("address", `${data.logradouro}, ${data.bairro}`);
        form.setValue("location", `${data.localidade}, ${data.uf}`);
        toast({ title: "Endereço encontrado!", description: "Os campos de endereço foram preenchidos." });

    } catch (error) {
        console.error("CEP fetch error:", error);
        toast({ title: "Erro ao buscar CEP", description: "Não foi possível encontrar o endereço. Verifique o CEP e tente novamente.", variant: "destructive"});
    } finally {
        setIsFetchingCep(false);
    }
  };


  const handleGenerateDescription = async () => {
    const name = form.getValues("name");
    const category = form.getValues("category");

    if (!name || !category) {
        toast({
            title: "Faltam Informações",
            description: "Preencha o nome e a categoria para gerar uma descrição.",
            variant: "destructive"
        });
        return;
    }

    setIsGenerating(true);
    try {
        const result = await generateRestaurantDescription({
            restaurantName: name,
            restaurantType: category
        });
        form.setValue("description", result, { shouldValidate: true });
        toast({
            title: "Descrição Gerada!",
            description: "A IA criou uma descrição para o seu restaurante."
        });
    } catch(error) {
        console.error("Error generating description:", error);
        toast({
            title: "Erro na Geração",
            description: "Não foi possível gerar a descrição. Tente novamente.",
            variant: "destructive"
        });
    } finally {
        setIsGenerating(false);
    }
  };

  async function onSubmit(values: RestaurantFormData) {
    setIsSubmitting(true);
    try {
      if (restaurant?.id) {
        const finalValues = { 
            ...(restaurant as Restaurant),
            ...values, 
            id: restaurant.id, 
        };
        updateRestaurant(finalValues);
        toast({
            title: "Sucesso!",
            description: "Restaurante atualizado.",
        });
      } else {
        addRestaurant(values as NewRestaurant);
        toast({
            title: "Sucesso!",
            description: "Novo restaurante adicionado.",
        });
      }
      form.reset({ ...defaultValues, cep: '' });
      onFormSubmit();
    } catch (error: any) {
        console.error(error);
        toast({
            title: "Erro",
            description: `Não foi possível ${restaurant?.id ? 'atualizar' : 'adicionar'} o restaurante.`,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Restaurante</FormLabel>
            <FormControl><Input placeholder="Ex: Trattoria del Ponte" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <div className="flex items-center gap-2">
                        <FormControl>
                            <Input placeholder="Digite o CEP" {...field} value={field.value || ''} />
                        </FormControl>
                        <Button type="button" onClick={handleFetchCep} disabled={isFetchingCep}>
                           {isFetchingCep ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl><Input placeholder="Preenchido automaticamente..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Localização (Bairro, Cidade)</FormLabel>
                    <FormControl><Input placeholder="Preenchido automaticamente..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="logo" render={({ field }) => (
                <FormItem>
                    <FormLabel>URL da Logo</FormLabel>
                     <FormControl>
                        <Input placeholder="https://exemplo.com/logo.png" {...field} />
                     </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem>
                    <FormLabel>URL da Imagem Principal</FormLabel>
                    <FormControl>
                        <Input placeholder="https://exemplo.com/imagem.png" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>

        <FormField control={form.control} name="ownerEmail" render={({ field }) => (
            <FormItem>
                <FormLabel>E-mail do Proprietário</FormLabel>
                <FormControl><Input type="email" placeholder="gerente@exemplo.com" {...field} disabled={isNewRestaurantOnboarding} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="plan" render={({ field }) => (
                <FormItem>
                    <FormLabel>Plano</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isNewRestaurantOnboarding}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o plano" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Insights">Plano Insights</SelectItem>
                        <SelectItem value="Digital">Plano Digital</SelectItem>
                        <SelectItem value="Completo">Plano Completo</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="italiana">Italiana</SelectItem>
                        <SelectItem value="japonesa">Japonesa</SelectItem>
                        <SelectItem value="lanchonete">Lanchonete</SelectItem>
                        <SelectItem value="brasileira">Brasileira</SelectItem>
                        <SelectItem value="francesa">Francesa</SelectItem>
                        <SelectItem value="asiatica">Asiática</SelectItem>
                        <SelectItem value="arabe">Árabe</SelectItem>
                        <SelectItem value="carnes">Carnes</SelectItem>
                        <SelectItem value="saudavel">Saudável</SelectItem>
                        <SelectItem value="doceria">Doceria</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
                <FormLabel>Descrição</FormLabel>
                <div className="relative">
                    <FormControl><Textarea placeholder="Descreva o restaurante..." {...field} rows={5} /></FormControl>
                    <Button type="button" size="sm" variant="outline" className="absolute bottom-2 right-2" onClick={handleGenerateDescription} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isGenerating ? "Gerando..." : "Gerar com IA"}
                    </Button>
                </div>
                <FormMessage />
            </FormItem>
        )} />
       
        <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl><Input placeholder="(11) 1234-5678" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
         <FormField control={form.control} name="pin" render={({ field }) => (
            <FormItem>
                <FormLabel>PIN de Segurança (4 dígitos)</FormLabel>
                <FormControl><Input type="password" maxLength={4} placeholder="****" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField control={form.control} name="sac" render={({ field }) => (
            <FormItem>
                <FormLabel>E-mail SAC</FormLabel>
                <FormControl><Input type="email" placeholder="contato@restaurante.com" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        
        <Separator />
        
        <div>
          <FormLabel>Imagens da Galeria</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2 my-2 p-2 border rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                    <FormField control={form.control} name={`galleryImages.${index}.url`} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">URL da Imagem {index + 1}</FormLabel>
                             <FormControl>
                                <Input placeholder="https://exemplo.com/galeria.png" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name={`galleryImages.${index}.hint`} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Dica da Imagem {index + 1}</FormLabel>
                            <FormControl><Input placeholder="Ex: prato de massa" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "", hint: "" })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Imagem à Galeria
          </Button>
          <FormMessage>{form.formState.errors.galleryImages?.message || form.formState.errors.galleryImages?.root?.message}</FormMessage>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {restaurant?.id ? "Salvar Alterações" : "Salvar e Concluir Cadastro"}
        </Button>
      </form>
    </Form>
  );
}
