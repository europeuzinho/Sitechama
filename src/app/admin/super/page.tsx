
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Building, DollarSign, PlusCircle, Pencil, ExternalLink, ShieldCheck, Sparkles, LogIn, Settings } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TooltipProvider, Tooltip as TooltipComponent, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Restaurant, getRestaurants } from "@/lib/restaurants-data";
import { useAuth } from "@/hooks/use-auth";
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RestaurantForm } from "@/components/restaurant-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteConfigForm } from "@/components/site-config-form";
import { getSiteConfig } from "@/lib/site-config-store";


const generateChartData = (monthlyRevenue: number) => {
    const data = [];
    for (let i = 5; i >= 1; i--) {
        const date = subMonths(new Date(), i);
        data.push({
            month: format(date, "MMM", { locale: ptBR }),
            revenue: Math.floor(monthlyRevenue * (1 - (i * 0.05 + Math.random() * 0.1))),
        });
    }
    data.push({
        month: format(new Date(), "MMM", { locale: ptBR }),
        revenue: monthlyRevenue
    });
    return data;
};


export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { user, loading, impersonateUser } = useAuth();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  
  const loadData = () => {
    setRestaurants(getRestaurants());
    setLogoUrl(getSiteConfig().logoUrl);
  }

  useEffect(() => {
    loadData();
    window.addEventListener('restaurantsChanged', loadData);
    window.addEventListener('siteConfigChanged', loadData);


    return () => {
        window.removeEventListener('restaurantsChanged', loadData);
        window.removeEventListener('siteConfigChanged', loadData);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || user.email !== "europeueditor@gmail.com") {
      router.push('/login');
    }
  }, [user, loading, router]);


  const totalRestaurants = restaurants.length;
  const newSignupsThisMonth = restaurants.filter(r => new Date(r.createdAt || 0) > subMonths(new Date(), 1)).length;


  const calculateMonthlyRevenue = () => {
    return restaurants.reduce((total, restaurant) => {
      switch (restaurant.plan) {
        case 'Insights':
          return total + 99;
        case 'Digital':
          return total + 189;
        case 'Completo':
          return total + 299;
        default:
          return total;
      }
    }, 0);
  };

  const monthlyRevenue = calculateMonthlyRevenue();
  const chartData = generateChartData(monthlyRevenue);

  const handleFormSubmit = () => {
    loadData(); 
    setIsFormOpen(false);
    setEditingRestaurant(null);
  }

  const handleEditClick = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setIsFormOpen(true);
  }

  const handleAddClick = () => {
    setEditingRestaurant(null);
    setIsFormOpen(true);
  }

  const handleDialogChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingRestaurant(null);
    }
  }

  const handleImpersonate = (restaurant: Restaurant) => {
    impersonateUser(restaurant.ownerEmail, restaurant.name);
    router.push(`/admin/dashboard/${restaurant.id}`);
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
          <Header/>
          <main className="flex-1 bg-secondary/50">
            <div className="container mx-auto max-w-7xl py-12 md:py-16 space-y-8">
              <Skeleton className="h-10 w-1/3" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
              </div>
               <div className="mt-8 grid gap-8 md:grid-cols-2">
                   <Skeleton className="h-96 w-full" />
                   <Skeleton className="h-96 w-full" />
               </div>
            </div>
          </main>
          <Footer/>
      </div>
    )
  }
  
  if (user.email !== "europeueditor@gmail.com") {
      return <div className="flex min-h-screen items-center justify-center"><p>Acesso negado.</p></div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto max-w-7xl py-12 md:py-16">
          <div className="mb-8 flex items-center justify-between">
             <div className="flex items-center gap-4">
                 {logoUrl && (
                    <Image
                        src={logoUrl}
                        alt="Chama Logo"
                        width={48}
                        height={48}
                        data-ai-hint="logo"
                    />
                 )}
                 <div>
                     <h1 className="font-headline text-4xl md:text-5xl font-bold">
                       Painel Super Admin
                     </h1>
                     <p className="mt-2 text-muted-foreground">
                       Visão geral de toda a plataforma Chama.
                     </p>
                 </div>
             </div>
             <Dialog open={isFormOpen} onOpenChange={handleDialogChange}>
               <DialogTrigger asChild>
                 <Button onClick={handleAddClick}>
                   <PlusCircle className="mr-2 h-4 w-4" />
                   Adicionar Restaurante
                 </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[600px]">
                 <DialogHeader>
                   <DialogTitle className="font-headline text-2xl">{editingRestaurant ? 'Editar Restaurante' : 'Novo Restaurante'}</DialogTitle>
                 </DialogHeader>
                 <div className="pt-4 max-h-[80vh] overflow-y-auto pr-4">
                    <RestaurantForm 
                        onFormSubmit={handleFormSubmit} 
                        restaurant={editingRestaurant} 
                    />
                 </div>
               </DialogContent>
             </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {monthlyRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Receita baseada nos planos</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Restaurantes</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRestaurants}</div>
                  <p className="text-xs text-muted-foreground">Restaurantes cadastrados</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Novos Cadastros (Mês)</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{newSignupsThisMonth}</div>
                  <p className="text-xs text-muted-foreground">Novos restaurantes nos últimos 30 dias</p>
                </CardContent>
              </Card>
          </div>
          
            <Tabs defaultValue="restaurants" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="restaurants"><Building className="mr-2"/>Restaurantes</TabsTrigger>
                    <TabsTrigger value="settings"><Settings className="mr-2"/>Configurações do Site</TabsTrigger>
                </TabsList>
                <TabsContent value="restaurants">
                     <div className="grid gap-8 md:grid-cols-2">
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle className="font-headline text-3xl font-bold">
                                    Evolução da Receita
                                </CardTitle>
                                <CardDescription>
                                    Receita mensal simulada nos últimos 6 meses.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <XAxis
                                            dataKey="month"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `R$${value}`}
                                        />
                                        <Tooltip 
                                            cursor={{fill: 'hsl(var(--muted))'}}
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                borderColor: 'hsl(var(--border))'
                                            }}
                                        />
                                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle className="font-headline text-3xl font-bold">
                                    Lista de Restaurantes
                                </CardTitle>
                                <CardDescription>
                                    Gerencie todos os restaurantes da plataforma.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TooltipProvider>
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Plano</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {restaurants.map((restaurant) => (
                                        <TableRow key={restaurant.id}>
                                        <TableCell>
                                            <div className="font-medium">{restaurant.name}</div>
                                            <div className="text-xs text-muted-foreground">{restaurant.ownerEmail}</div>
                                        </TableCell>
                                        <TableCell>
                                            {restaurant.plan ? (
                                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                                <ShieldCheck className="h-3 w-3" />
                                                {restaurant.plan}
                                            </Badge>
                                            ) : (
                                            <span className="text-muted-foreground text-xs">Nenhum</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <TooltipComponent>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handleImpersonate(restaurant)}>
                                                        <LogIn className="h-4 w-4" />
                                                        <span className="sr-only">Acessar como {restaurant.name}</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Acessar como {restaurant.name}</p>
                                                </TooltipContent>
                                            </TooltipComponent>
                                            <TooltipComponent>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(restaurant)}>
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Editar Restaurante</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Editar {restaurant.name}</p>
                                                </TooltipContent>
                                            </TooltipComponent>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/dashboard/${restaurant.id}`}>
                                                Ver Painel
                                                <ExternalLink className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                </TooltipProvider>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                 <TabsContent value="settings">
                    <SiteConfigForm />
                </TabsContent>
            </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
