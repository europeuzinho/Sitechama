
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Employee, Restaurant } from '@/lib/restaurants-data';

const EMPLOYEE_SESSION_KEY = 'employee-session';

interface EmployeeSession {
    employee: Employee;
    restaurantId: string;
}

interface UseEmployeeAuthProps {
    restaurantId?: string;
    requiredRole?: Employee['role'];
}

export function useEmployeeAuth({ restaurantId, requiredRole }: UseEmployeeAuthProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    const clearSession = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(EMPLOYEE_SESSION_KEY);
        }
        setEmployee(null);
    }, []);

    useEffect(() => {
        setLoading(true);
        if (typeof window !== 'undefined') {
            const storedSession = window.sessionStorage.getItem(EMPLOYEE_SESSION_KEY);
            if (storedSession) {
                try {
                    const session: EmployeeSession = JSON.parse(storedSession);
                    // If a restaurantId is provided, validate the session against it
                    if (restaurantId && session.restaurantId !== restaurantId) {
                        toast({ title: "Sessão Inválida", description: "Você está logado em outro restaurante.", variant: "destructive" });
                        clearSession();
                        router.push(`/employee-login/${restaurantId}`);
                    } 
                    // If a requiredRole is provided, validate it
                    else if (requiredRole && session.employee.role !== requiredRole) {
                        toast({ title: "Acesso Negado", description: `Você não tem permissão de '${requiredRole}'.`, variant: "destructive" });
                        clearSession();
                        router.push(`/employee-login/${restaurantId}`);
                    } 
                    else {
                        setEmployee(session.employee);
                    }
                } catch (e) {
                    console.error("Failed to parse employee session", e);
                    clearSession();
                }
            } else if (restaurantId) {
                // If there's no session and we are on a protected page, redirect
                router.push(`/employee-login/${restaurantId}`);
            }
        }
        setLoading(false);
    }, [restaurantId, requiredRole, router, toast, clearSession]);

    const login = async (loginId: string, pin: string, restaurant: Restaurant): Promise<Employee | null> => {
        setLoading(true);
        const employeeToAuth = restaurant.employees?.find(emp => emp.login === loginId);

        if (!employeeToAuth) {
            toast({ title: "Login Inválido", description: "Funcionário não encontrado.", variant: "destructive" });
            setLoading(false);
            return null;
        }

        if (employeeToAuth.password !== pin) {
            toast({ title: "Senha Incorreta", description: "A senha inserida está incorreta.", variant: "destructive" });
            setLoading(false);
            return null;
        }

        const session: EmployeeSession = {
            employee: employeeToAuth,
            restaurantId: restaurant.id,
        };
        
        window.sessionStorage.setItem(EMPLOYEE_SESSION_KEY, JSON.stringify(session));
        setEmployee(employeeToAuth);
        setLoading(false);
        toast({ title: "Acesso Liberado!", description: `Bem-vindo(a), ${employeeToAuth.name}!` });
        return employeeToAuth;
    };
    
    const logout = useCallback(() => {
        clearSession();
        toast({ title: "Sessão encerrada."});
        if (restaurantId) {
          router.push(`/employee-login/${restaurantId}`);
        } else {
          router.push('/');
        }
    }, [clearSession, restaurantId, router, toast]);

    return { employee, loading, login, logout };
}
