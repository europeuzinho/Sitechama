

"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useRouter, useParams } from 'next/navigation';
import { format, parseISO, subDays, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from 'next/image';
import Link from 'next/link';
import { Users, Bookmark, Clock, ChevronDown, PlusCircle, RefreshCw, Star, Utensils, List, Menu as MenuIcon, Ticket, Table as TableIcon, ClipboardCheck, ExternalLink, X, CalendarOff, Wallet, ChefHat, KeySquare, Users2, Pencil, Trash2, ConciergeBell, UserCog, Cake, Landmark, Lock, Printer, Trophy } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ReservationsList } from "@/components/reservations-list";
import { WaitlistManager } from "@/components/waitlist-manager";
import { ReservationForm } from "@/components/reservation-form";
import { LiveMenuManager } from "@/components/live-menu-manager";
import { RedemptionCodeManager } from "@/components/redemption-code-manager";
import { TableManager } from "@/components/table-manager";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Reservation, getReservationsForDate, getReservations } from "@/lib/reservation-store";
import { getRestaurants, Restaurant, Review, updateRestaurant, Employee, CakeOrderSettings } from "@/lib/restaurants-data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PayoutSettingsManager } from "@/components/payout-settings-manager";
import { AdminSectionLock } from "@/components/admin-section-lock";
import { PrinterSettingsManager } from "@/components/printer-config-manager";
import { PointRedemptionManager } from '@/components/point-redemption-manager';

const generateClientChartData = (restaurantId: string) => {
  const data = [];
  const allRestaurantReservations = getReservations().filter(r => r.restaurantId === restaurantId);

  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, "yyyy-MM-dd");
    
    const clientsOnDate = allRestaurantReservations
      .filter(r => r.date === formattedDate && (r.status === "Confirmado" || r.status === 'Checked-in'))
      .reduce((sum, r) => sum + r.numberOfPeople, 0);

    data.push({
      date: format(date, "dd/MM"),
      clientes: clientsOnDate,
    });
  }
  return data;
};

const generateRatingChartData = (reviews: Review[]) => {
    const ratingCounts = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    reviews.forEach(review => {
        if (review.rating in ratingCounts) {
            ratingCounts[review.rating as keyof typeof ratingCounts]++;
        }
    });
    
    return Object.entries(ratingCounts).map(([name, value]) => ({ name: `${name} Estrelas`, value })).reverse();
};

const COLORS = ["#22c55e", "#84cc16", "#facc15", "#fb923c", "#ef4444"];


const EmployeeManager = ({ restaurant, onUpdate }: { restaurant: Restaurant; onUpdate: (data: Partial<Restaurant>) => void }) => {
    const { toast } = useToast();
    const [employees, setEmployees] = useState<Employee[]>(restaurant.employees || []);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    
    const [name, setName] = useState('');
    const [role, setRole] = useState<Employee['role'] | ''>('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');


    useEffect(() => {
        setEmployees(restaurant.employees || []);
    }, [restaurant.employees]);

    const resetForm = () => {
        setName('');
        setRole('');
        setLogin('');
        setPassword('');
        setEditingEmployee(null);
        setIsFormOpen(false);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !role || !login || !password) {
            toast({ title: "Campos obrigatórios", description: "Todos os campos (Nome, Função, Login, Senha) são necessários.", variant: "destructive" });
            return;
        }

        let updatedEmployees: Employee[];
        if (editingEmployee) {
            updatedEmployees = employees.map(emp => 
                emp.id === editingEmployee.id ? { ...emp, name, role: role as Employee['role'], login, password } : emp
            );
            toast({ title: "Funcionário atualizado!" });
        } else {
            const newEmployee: Employee = {
                id: Date.now().toString(),
                name,
                role: role as Employee['role'],
                login,
                password
            };
            updatedEmployees = [...employees, newEmployee];
            toast({ title: "Funcionário adicionado!" });
        }

        onUpdate({ employees: updatedEmployees });
        resetForm();
    };

    const handleEditClick = (employee: Employee) => {
        setEditingEmployee(employee);
        setName(employee.name);
        setRole(employee.role);
        setLogin(employee.login);
        setPassword(employee.password);
        setIsFormOpen(true);
    };
    
    const handleAddClick = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleDeleteClick = (employeeId: string) => {
        const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
        onUpdate({ employees: updatedEmployees });
        toast({ title: "Funcionário removido!" });
    };


    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-3xl font-bold">Quadro de Funcionários</CardTitle>
                    <CardDescription>Gerencie sua equipe e suas credenciais de acesso.</CardDescription>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddClick}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Adicionar Funcionário
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
                            <div>
                                <label htmlFor="employeeName" className="text-sm font-medium">Nome Completo</label>
                                <Input id="employeeName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do funcionário" />
                            </div>
                            <div>
                                <label htmlFor="employeeRole" className="text-sm font-medium">Função</label>
                                <Select value={role} onValueChange={(value) => setRole(value as Employee['role'])}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a função" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Garçom">Garçom</SelectItem>
                                        <SelectItem value="Caixa">Caixa</SelectItem>
                                        <SelectItem value="Cozinha">Cozinha</SelectItem>
                                        <SelectItem value="Recepção">Recepção</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="employeeLogin" className="text-sm font-medium">Login (Numérico)</label>
                                    <Input id="employeeLogin" value={login} onChange={(e) => setLogin(e.target.value.replace(/\D/g, ''))} placeholder="Ex: 1234" />
                                </div>
                                <div>
                                    <label htmlFor="employeePassword" className="text-sm font-medium">Senha (Numérica)</label>
                                    <Input type="password" id="employeePassword" value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))} placeholder="Ex: 5678" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={resetForm}>Cancelar</Button>
                                <Button type="submit">{editingEmployee ? 'Salvar Alterações' : 'Adicionar'}</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome Completo</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead>Login</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.length > 0 ? (
                                employees.map(employee => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                        <TableCell>{employee.role}</TableCell>
                                        <TableCell className="font-mono">{employee.login}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(employee)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação não pode ser desfeita. Isso removerá o funcionário permanentemente.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteClick(employee.id)}>Remover</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">Nenhum funcionário cadastrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


const CakeOrderSettingsManager = ({ restaurant, onUpdate }: { restaurant: Restaurant; onUpdate: (data: Partial<Restaurant>) => void }) => {
    const [settings, setSettings] = useState<CakeOrderSettings>(restaurant.cakeOrderSettings || {
        enabled: false, name: '', description: '', price: 0, pixKey: ''
    });

    useEffect(() => {
        setSettings(restaurant.cakeOrderSettings || {
            enabled: false, name: '', description: '', price: 0, pixKey: ''
        });
    }, [restaurant.cakeOrderSettings]);

    const handleToggle = (enabled: boolean) => {
        const newSettings = { ...settings, enabled };
        setSettings(newSettings);
        onUpdate({ cakeOrderSettings: newSettings });
    };

    const handleSave = () => {
        onUpdate({ cakeOrderSettings: settings });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl font-bold">Configurações de Encomendas</CardTitle>
                <CardDescription>Gerencie o serviço de encomenda de bolo para seus clientes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <Switch id="cake-order-enabled" checked={settings.enabled} onCheckedChange={handleToggle} />
                    <Label htmlFor="cake-order-enabled" className="text-base">Habilitar serviço de encomenda de bolo</Label>
                </div>

                {settings.enabled && (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="cakeName">Nome do Produto</Label>
                            <Input id="cakeName" value={settings.name} onChange={(e) => setSettings(s => ({ ...s, name: e.target.value }))} placeholder="Ex: Bolo de Aniversário Especial"/>
                        </div>
                        <div>
                            <Label htmlFor="cakeDescription">Descrição</Label>
                            <Textarea id="cakeDescription" value={settings.description} onChange={(e) => setSettings(s => ({ ...s, description: e.target.value }))} placeholder="Descreva o bolo, ingredientes, tamanho, etc."/>
                        </div>
                        <div>
                            <Label htmlFor="cakePrice">Preço (R$)</Label>
                            <Input id="cakePrice" type="number" value={settings.price} onChange={(e) => setSettings(s => ({ ...s, price: parseFloat(e.target.value) || 0 }))} />
                        </div>
                         <div>
                            <Label htmlFor="cakePixKey">Chave Pix para Pagamento</Label>
                            <Input id="cakePixKey" value={settings.pixKey} onChange={(e) => setSettings(s => ({ ...s, pixKey: e.target.value }))} placeholder="Insira sua chave Pix (Copia e Cola)"/>
                        </div>
                        <Button onClick={handleSave}>Salvar Alterações da Encomenda</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


export default function AdminDashboardPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);

  const loadAllData = useCallback(() => {
    if (typeof window === 'undefined') return;
    const allRestaurants = getRestaurants();
    const currentRestaurant = allRestaurants.find(r => r.id === restaurantId);

    if (currentRestaurant) {
        setRestaurant(currentRestaurant);
        setReservations(getReservationsForDate(currentRestaurant.id, currentRestaurant.tables || [], selectedDate || new Date()));
    } else {
        // Delay notFound to avoid SSR issues
        setTimeout(() => notFound(), 0);
    }
  }, [restaurantId, selectedDate]);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
        loadAllData();
    }

  }, [user, loading, router, loadAllData]);

  useEffect(() => {
    if (!user) return;
    
    const handleDataChange = () => {
        loadAllData();
    };

    window.addEventListener('reservationsChanged', handleDataChange);
    window.addEventListener('restaurantsChanged', handleDataChange);
    window.addEventListener('waitlistChanged', handleDataChange);
    window.addEventListener('ordersChanged', handleDataChange);
    window.addEventListener('comandasChanged', handleDataChange);

    return () => {
        window.removeEventListener('reservationsChanged', handleDataChange);
        window.removeEventListener('restaurantsChanged', handleDataChange);
        window.removeEventListener('waitlistChanged', handleDataChange);
        window.removeEventListener('ordersChanged', handleDataChange);
        window.removeEventListener('comandasChanged', handleDataChange);
    };
  }, [loadAllData, user]);


  useEffect(() => {
    const isOwner = user?.email === restaurant?.ownerEmail;
    const isSuperAdmin = user?.email === "europeueditor@gmail.com";

    if (restaurant && !isOwner && !isSuperAdmin) {
      toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar este painel.",
          variant: "destructive"
      });
      router.push('/login');
    }
  }, [user?.email, restaurant, router, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (restaurant && date) {
      setReservations(getReservationsForDate(restaurantId, restaurant.tables || [], date));
    }
    setIsCalendarOpen(false);
  };

  const handleRefresh = () => {
    loadAllData();
    toast({
        title: "Dados Atualizados",
        description: "As informações do painel foram recarregadas.",
    });
  };

  const handleDataUpdate = (updatedData: Partial<Restaurant>) => {
    if (!restaurant) return;
    const updatedRestaurant = { ...restaurant, ...updatedData };
    updateRestaurant(updatedRestaurant);
    setRestaurant(updatedRestaurant);
     toast({
        title: "Informações Atualizadas",
        description: "Os dados do restaurante foram salvos com sucesso.",
    });
  };

  const handleToggleBlockDate = () => {
    if (!restaurant || !selectedDate) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const currentBlockedDates = restaurant.blockedDates || [];
    let updatedBlockedDates: string[];
    let message = "";

    if (currentBlockedDates.includes(dateStr)) {
        updatedBlockedDates = currentBlockedDates.filter(d => d !== dateStr);
        message = `O dia ${format(selectedDate, "dd/MM/yyyy")} foi desbloqueado para reservas.`;
    } else {
        updatedBlockedDates = [...currentBlockedDates, dateStr];
        message = `O dia ${format(selectedDate, "dd/MM/yyyy")} foi bloqueado para reservas.`;
    }

    const updatedRestaurant = { ...restaurant, blockedDates: updatedBlockedDates };
    updateRestaurant(updatedRestaurant);
    setRestaurant(updatedRestaurant); // Update local state immediately

    toast({
        title: "Disponibilidade Atualizada",
        description: message,
    });
};

  if (loading || !user || !restaurant) {
    return <div className="flex min-h-screen items-center justify-center"><p>Carregando painel...</p></div>
  }
  
  const clientChartData = generateClientChartData(restaurantId);
  const ratingChartData = generateRatingChartData(restaurant.reviews || []);

  const filteredReservations = reservations;
    
  const totalReservations = filteredReservations.length;
  const totalGuests = filteredReservations.reduce((sum, res) => sum + res.numberOfPeople, 0);
  const averageRating = restaurant.reviews && restaurant.reviews.length > 0 
    ? (restaurant.reviews.reduce((acc, review) => acc + review.rating, 0) / restaurant.reviews.length).toFixed(1)
    : 'N/A';

  const upcomingReservations = filteredReservations
    .filter(res => res.status === "Confirmado")
    .sort((a, b) => a.time.localeCompare(b.time))
    .find(res => {
      if (!selectedDate) return false;
      const reservationDateTime = parseISO(`${format(selectedDate, "yyyy-MM-dd")}T${res.time}:00`);
      return reservationDateTime > new Date();
    });
    
  const hasInsightsPlan = restaurant.plan === 'Insights' || restaurant.plan === 'Digital' || restaurant.plan === 'Completo';
  const hasDigitalPlan = restaurant.plan === 'Digital' || restaurant.plan === 'Completo';
  const hasCompletoPlan = restaurant.plan === 'Completo';


  const blockedDatesAsDates = (restaurant.blockedDates || []).map(dateStr => parse(dateStr, 'yyyy-MM-dd', new Date()));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto max-w-7xl py-12 md:py-16">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                {restaurant.logo && (
                    <Image 
                        src={restaurant.logo} 
                        alt={`Logo do ${restaurant.name}`} 
                        width={64} 
                        height={64} 
                        className="rounded-lg object-contain bg-card p-1 shadow-sm"
                        data-ai-hint="restaurant logo" 
                    />
                )}
                <div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">
                      {restaurant.name}
                    </h1>
                    <p className="mt-2 text-muted-foreground text-lg">
                      Seja bem-vindo ao seu painel de insights e reservas.
                    </p>
                </div>
             </div>
             <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="icon" onClick={handleRefresh} title="Atualizar dados">
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Atualizar</span>
                </Button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <MenuIcon className="mr-2 h-4 w-4" />
                            Modos de Operação
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                             <Link href={`/employee-login/${restaurant.id}`}>
                                <KeySquare className="mr-2 h-4 w-4" />
                                Acesso de Funcionários
                                <ExternalLink className="ml-auto h-3 w-3" />
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                 <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                      <span className="flex-1 truncate">
                          {selectedDate
                          ? format(selectedDate, "PPP", { locale: ptBR })
                          : "Selecionar Data"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-auto p-0">
                     <DialogHeader>
                        <DialogTitle className="sr-only">Seletor de Datas</DialogTitle>
                     </DialogHeader>
                     <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        locale={ptBR}
                        modifiers={{ blocked: blockedDatesAsDates }}
                        modifiersClassNames={{
                            blocked: "text-destructive line-through",
                        }}
                        footer={
                          <div className="p-4 border-t">
                            <Button onClick={handleToggleBlockDate} className="w-full" variant="destructive" disabled={!selectedDate}>
                                <CalendarOff className="mr-2 h-4 w-4" />
                                {selectedDate && restaurant.blockedDates?.includes(format(selectedDate, "yyyy-MM-dd"))
                                ? "Desbloquear Dia"
                                : "Bloquear Dia"}
                            </Button>
                          </div>
                        }
                    />
                  </DialogContent>
                </Dialog>
                 <Dialog open={isReservationFormOpen} onOpenChange={setIsReservationFormOpen}>
                   <DialogTrigger asChild>
                     <Button>
                       <PlusCircle className="mr-2 h-4 w-4" />
                       Nova Reserva
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
                       <DialogTitle className="font-headline text-2xl">Nova Reserva</DialogTitle>
                     </DialogHeader>
                     <div className="pt-4">
                       <ReservationForm 
                          selectedDate={selectedDate} 
                          restaurantId={restaurantId}
                          onSuccess={() => setIsReservationFormOpen(false)}
                          successTitle="Reserva Adicionada"
                          successDescription="A reserva do seu cliente foi registrada com sucesso."
                       />
                     </div>
                   </DialogContent>
                 </Dialog>
             </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservas do Dia</CardTitle>
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalReservations}</div>
                  <p className="text-xs text-muted-foreground">Total de mesas reservadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Convidados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalGuests}</div>
                  <p className="text-xs text-muted-foreground">Total de pessoas esperadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Chegada</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {upcomingReservations ? (
                    <>
                      <div className="text-2xl font-bold">{upcomingReservations.time}</div>
                      <p className="text-xs text-muted-foreground">Reserva de {upcomingReservations.fullName}</p>
                    </>
                  ) : (
                    <div className="text-lg font-semibold pt-2">N/A</div>
                  )}
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageRating}</div>
                  <p className="text-xs text-muted-foreground">Baseado em {restaurant.reviews?.length || 0} avaliações</p>
                </CardContent>
              </Card>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 mb-8">
                <TabsTrigger value="overview"><List className="mr-2"/>Visão Geral</TabsTrigger>
                <TabsTrigger value="tables"><TableIcon className="mr-2"/>Mesas</TabsTrigger>
                <TabsTrigger value="waitlist"><MenuIcon className="mr-2"/>Fila de Espera</TabsTrigger>
                {hasDigitalPlan && <TabsTrigger value="menu"><Utensils className="mr-2"/>Cardápio</TabsTrigger>}
                {hasDigitalPlan && <TabsTrigger value="orders"><Cake className="mr-2"/>Encomendas</TabsTrigger>}
                {hasCompletoPlan && <TabsTrigger value="codes"><Ticket className="mr-2"/>Códigos</TabsTrigger>}
                {hasCompletoPlan && <TabsTrigger value="loyalty"><Trophy className="mr-2"/>Fidelidade</TabsTrigger>}
                <TabsTrigger value="employees"><Users2 className="mr-2"/>Funcionários</TabsTrigger>
                <TabsTrigger value="payouts"><Landmark className="mr-2"/>Financeiro</TabsTrigger>
                <TabsTrigger value="printers"><Printer className="mr-2"/>Impressoras</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-3xl font-bold">
                          Lista de Reservas
                      </CardTitle>
                      <CardDescription>
                          Todas as reservas para a data selecionada.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                      <ReservationsList reservations={reservations} />
                  </CardContent>
                </Card>

                 
                   {hasInsightsPlan ? (
                      <div className="grid gap-8 md:grid-cols-2">
                      <Card>
                          <CardHeader>
                              <CardTitle className="font-headline text-2xl font-bold">
                                  Evolução de Clientes
                              </CardTitle>
                              <CardDescription>
                                  Número de clientes nos últimos 7 dias.
                              </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                  <BarChart data={clientChartData}>
                                      <XAxis
                                          dataKey="date"
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
                                          tickFormatter={(value) => `${value}`}
                                          allowDecimals={false}
                                      />
                                      <Tooltip 
                                          cursor={{fill: 'hsl(var(--muted))'}}
                                          contentStyle={{
                                              backgroundColor: 'hsl(var(--background))',
                                              borderColor: 'hsl(var(--border))'
                                          }}
                                      />
                                      <Bar dataKey="clientes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                              </ResponsiveContainer>
                          </CardContent>
                      </Card>
                       <Card>
                          <CardHeader>
                              <CardTitle className="font-headline text-2xl font-bold">
                                  Distribuição de Avaliações
                              </CardTitle>
                              <CardDescription>
                                  Como os clientes avaliam seu restaurante.
                              </CardDescription>
                          </CardHeader>
                          <CardContent>
                              <ResponsiveContainer width="100%" height={250}>
                                  <PieChart>
                                      <Pie data={ratingChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                          {ratingChartData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                          ))}
                                      </Pie>
                                      <Tooltip
                                          contentStyle={{
                                              backgroundColor: 'hsl(var(--background))',
                                              borderColor: 'hsl(var(--border))'
                                          }}
                                      />
                                  </PieChart>
                              </ResponsiveContainer>
                          </CardContent>
                      </Card>
                    </div>
                   ) : (
                     <Card className="flex items-center justify-center flex-col text-center h-full p-8 bg-gradient-to-br from-primary/5 to-transparent">
                         <CardHeader>
                            <CardTitle className="font-headline text-2xl font-bold">
                                Desbloqueie mais Insights!
                            </CardTitle>
                            <CardDescription>
                                Faça upgrade para o Plano Insights ou superior para ver gráficos detalhados sobre seus clientes e avaliações.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/plans?plan=insights">Ver Planos</Link>
                            </Button>
                        </CardContent>
                     </Card>
                   )}
                
              </div>
            </TabsContent>

            <TabsContent value="tables">
                <TableManager restaurant={restaurant} onTablesUpdate={(updatedRestaurant) => handleDataUpdate(updatedRestaurant)} />
            </TabsContent>

            <TabsContent value="waitlist">
                <WaitlistManager restaurantId={restaurantId} />
            </TabsContent>
            
            {hasDigitalPlan && (
                <TabsContent value="menu">
                    <LiveMenuManager restaurantId={restaurantId} />
                </TabsContent>
            )}

            {hasDigitalPlan && (
                <TabsContent value="orders">
                    <CakeOrderSettingsManager restaurant={restaurant} onUpdate={handleDataUpdate} />
                </TabsContent>
            )}

            {hasCompletoPlan && (
                <TabsContent value="codes">
                    <RedemptionCodeManager restaurantId={restaurantId} />
                </TabsContent>
            )}

            {hasCompletoPlan && (
                <TabsContent value="loyalty">
                    <PointRedemptionManager restaurant={restaurant} />
                </TabsContent>
            )}
            
            <TabsContent value="employees">
                <AdminSectionLock title="Quadro de Funcionários">
                   <EmployeeManager restaurant={restaurant} onUpdate={handleDataUpdate} />
                </AdminSectionLock>
            </TabsContent>
            
            <TabsContent value="payouts">
                 <AdminSectionLock title="Informações Financeiras">
                    <PayoutSettingsManager restaurant={restaurant} onUpdate={handleDataUpdate} />
                </AdminSectionLock>
            </TabsContent>
            
            <TabsContent value="printers">
                 <AdminSectionLock title="Configuração de Impressoras">
                    <PrinterSettingsManager restaurant={restaurant} onUpdate={handleDataUpdate} />
                </AdminSectionLock>
            </TabsContent>


          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
