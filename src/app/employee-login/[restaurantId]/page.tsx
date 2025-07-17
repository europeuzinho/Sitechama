
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, Loader2 } from "lucide-react";
import { getRestaurants, Restaurant, Employee } from "@/lib/restaurants-data";
import { useEmployeeAuth } from "@/hooks/use-employee-auth";

export default function EmployeeLoginPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { login: performLogin, loading } = useEmployeeAuth({});
    
    const restaurantId = params.restaurantId as string;
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (restaurantId) {
            const allRestaurants = getRestaurants();
            const currentRestaurant = allRestaurants.find(r => r.id === restaurantId);
            if (currentRestaurant) {
                setRestaurant(currentRestaurant);
            } else {
                notFound();
            }
        }
    }, [restaurantId]);

    const handleRedirect = (role: Employee['role']) => {
        switch (role) {
            case "Caixa":
                router.push(`/cashier/${restaurantId}`);
                break;
            case "Cozinha":
                router.push(`/kds/${restaurantId}`);
                break;
            case "Recepção":
                router.push(`/reception/${restaurantId}`);
                break;
            case "Garçom":
                router.push(`/service/${restaurantId}`);
                break;
            default:
                toast({ title: "Função Desconhecida", description: "Sua função não tem uma tela de trabalho definida.", variant: "destructive" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurant || !login || !password) {
            toast({ title: "Campos obrigatórios", description: "Login e senha são necessários.", variant: "destructive" });
            return;
        }

        const employee = await performLogin(login, password, restaurant);

        if (employee) {
            handleRedirect(employee.role);
        }
        // Error toasts are handled within the useEmployeeAuth hook
    };

    if (!restaurant) {
        return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <Lock className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="font-headline text-3xl">Acesso do Funcionário</CardTitle>
                    <CardDescription>
                        Bem-vindo(a) ao {restaurant.name}. Insira suas credenciais.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="employeeLogin" className="text-sm font-medium">Login Numérico</label>
                            <Input
                                id="employeeLogin"
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value.replace(/\D/g, ''))}
                                placeholder="Seu login"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="employeePassword" className="text-sm font-medium">Senha Numérica</label>
                            <Input
                                id="employeePassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                                placeholder="Sua senha"
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                            {loading ? "Verificando..." : "Entrar"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
