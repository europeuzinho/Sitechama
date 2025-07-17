
"use client";

import { useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";

interface AdminSectionLockProps {
  children: ReactNode;
  title: string;
}

const SESSION_STORAGE_KEY = "admin-auth-verified";

const passwordSchema = z.object({
  password: z.string().min(1, "A senha é obrigatória."),
});

export function AdminSectionLock({ children, title }: AdminSectionLockProps) {
    const { user, reauthenticate, loading } = useAuth();
    const { toast } = useToast();
    
    // Check sessionStorage for a flag to avoid re-prompting on the same session
    const isInitiallyVerified = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true' : false;
    const [isVerified, setIsVerified] = useState(isInitiallyVerified);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "" },
    });

    const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
        if (!user) return;

        const success = await reauthenticate(values.password);
        if (success) {
            toast({ title: "Acesso Liberado!", description: `Acesso à seção de ${title.toLowerCase()} concedido.` });
            sessionStorage.setItem(SESSION_STORAGE_KEY, 'true'); // Set flag in session storage
            setIsVerified(true);
            setIsDialogOpen(false);
            form.reset();
        } else {
            toast({
                title: "Senha Incorreta",
                description: "A senha inserida não corresponde à sua conta.",
                variant: "destructive",
            });
        }
    };
    
    if (isVerified) {
        return <>{children}</>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl font-bold">{title}</CardTitle>
                <CardDescription>Esta é uma área segura. Para acessar, confirme sua identidade.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Lock className="mr-2 h-4 w-4" />
                            Desbloquear Acesso
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Verificação de Segurança</DialogTitle>
                            <DialogDescription>
                                Por favor, insira a senha da sua conta de administrador para continuar.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sua Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verificar Identidade
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
