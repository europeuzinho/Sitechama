

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { getSiteConfig, updateSiteConfig } from "@/lib/site-config-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const siteConfigSchema = z.object({
  siteName: z.string().min(2, "O nome do site é obrigatório."),
  logoUrl: z.string().url("Por favor, insira uma URL válida para a logo."),
});

type SiteConfigFormData = z.infer<typeof siteConfigSchema>;

export function SiteConfigForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SiteConfigFormData>({
    resolver: zodResolver(siteConfigSchema),
    defaultValues: {
      siteName: "",
      logoUrl: "",
    },
  });

  useEffect(() => {
    const config = getSiteConfig();
    form.reset(config);
  }, [form]);

  const onSubmit = (data: SiteConfigFormData) => {
    setIsSubmitting(true);
    const success = updateSiteConfig(data);
    if (success) {
      toast({
        title: "Configurações Salvas!",
        description: "As informações do site foram atualizadas.",
      });
    } else {
      toast({
          title: "Erro de Armazenamento",
          description: "Ocorreu um erro ao salvar. O logo pode ser muito grande.",
          variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl font-bold">
          Configurações Gerais do Site
        </CardTitle>
        <CardDescription>
          Altere o nome e o logo da plataforma. As alterações serão refletidas em todo o site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Site</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Chama Reservas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Logo</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Configurações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
