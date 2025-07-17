// ARQUIVO PRINCIPAL: PÁGINA INICIAL
// Este arquivo define o conteúdo da sua homepage, a primeira página que os visitantes veem.
// É a "capa do livro" do seu site. Se você quiser mudar o texto de boas-vindas ou a imagem principal, é aqui que você mexe.
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Search, UtensilsCrossed, Star, Users, Check, TrendingUp, MonitorPlay, Combine, X, Ticket, ShieldCheck, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RestaurantCard } from '@/components/restaurant-card';
import { getRestaurants, categories, Restaurant } from '@/lib/restaurants-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    setRestaurants(getRestaurants());
  }, []);

  const popularRestaurants = restaurants.slice(0, 3);
  const categoryEntries = Object.entries(categories);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative h-[60vh] w-full flex items-center justify-center">
          <Image
            src="https://s1.1zoom.me/b6648/834/Tomatoes_Pasta_Fork_Plate_544330_1920x1080.jpg"
            alt="Mesa de restaurante aconchegante"
            fill
            style={{objectFit: 'cover'}}
            className="brightness-50"
            priority
            data-ai-hint="cozy restaurant"
          />
          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center text-center text-white p-4">
            <h1 className="font-headline text-5xl md:text-7xl font-bold">
              Sua próxima experiência gastronômica começa aqui.
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl">
              Descubra e reserve mesas nos melhores restaurantes da sua cidade.
            </p>
            <form onSubmit={handleSearch} className="mt-8 w-full max-w-2xl flex flex-col md:flex-row items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      type="text" 
                      placeholder="Busque por restaurante, culinária ou local" 
                      className="w-full pl-10 text-base h-12 border-0 focus-visible:ring-transparent" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button type="submit" size="lg" className="w-full md:w-auto h-12">
                  Buscar
                </Button>
            </form>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-12">
              Como Funciona
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <Card className="text-center bg-gradient-to-br from-blue-50 to-background rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Search className="h-8 w-8" />
                            </div>
                            <span className="font-headline text-2xl">1. Encontre</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Explore uma seleção de restaurantes e descubra novos sabores perto de você.</p>
                    </CardContent>
                </Card>
                <Card className="text-center bg-gradient-to-br from-blue-50 to-background rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UtensilsCrossed className="h-8 w-8" />
                            </div>
                            <span className="font-headline text-2xl">2. Reserve</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Escolha a data, horário e número de pessoas. Garanta sua mesa em segundos.</p>
                    </CardContent>
                </Card>
                <Card className="text-center bg-gradient-to-br from-blue-50 to-background rounded-2xl">
                     <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                           <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Star className="h-8 w-8" />
                            </div>
                            <span className="font-headline text-2xl">3. Desfrute</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Aproveite sua refeição. Deixe avaliações e compartilhe sua experiência.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-12">
              Explore por Categoria
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categoryEntries.map(([key, { name, Icon }]) => (
                    <Button variant="outline" asChild key={key} className="h-24 flex-col gap-2 text-base font-semibold hover:bg-primary/5 hover:border-primary rounded-lg">
                        <Link href={`/category/${key}`}>
                            <Icon className="h-8 w-8 text-primary" />
                            <span>{name}</span>
                        </Link>
                    </Button>
                ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
             <div className="text-center mb-12">
                <h2 className="font-headline text-3xl md:text-4xl font-bold">
                Restaurantes Populares
                </h2>
                <Button variant="link" asChild className="mt-2">
                    <Link href="/restaurants">Ver todos os restaurantes</Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">
                        Soluções Inteligentes para o seu Restaurante
                    </h2>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Escolha o plano ideal e transforme a gestão do seu negócio com ferramentas poderosas para encantar seus clientes.
                    </p>
                </div>

                 <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
                    {/* PLANO INSIGHTS */}
                    <Card className="flex flex-col rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2"><BarChart2 /> Insights</CardTitle>
                            <CardDescription>Organize, gerencie e analise suas reservas e clientes.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-4xl font-bold text-center mb-6">R$ 99<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                            <Separator />
                            <ul className="space-y-4 mt-6 text-sm">
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Painel de Admin</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Gestão de Reservas</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Modo Recepção e Fila de Espera</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Análise de Dados (Insights)</li>
                                <li className="flex items-center gap-2 text-muted-foreground"><X className="text-red-500" /> Cardápio Digital (LiveMenu)</li>
                                <li className="flex items-center gap-2 text-muted-foreground"><X className="text-red-500" /> Modos Caixa, Garçom e Cozinha</li>
                                <li className="flex items-center gap-2 text-muted-foreground"><X className="text-red-500" /> Códigos de Fidelidade</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/plans?plan=insights">Quero contratar</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* PLANO COMPLETO */}
                    <Card className="flex flex-col border-primary border-2 relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                        <Badge className="absolute -top-4 right-1/2 translate-x-1/2">Recomendado</Badge>
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2 text-primary"><Combine /> Completo</CardTitle>
                            <CardDescription>A solução definitiva para gestão e operação completa.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <p className="text-4xl font-bold text-center mb-6 text-primary">R$ 299<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                            <Separator />
                            <ul className="space-y-4 mt-6 text-sm">
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Painel de Admin</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Gestão de Reservas</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Modo Recepção e Fila de Espera</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Análise de Dados (Insights)</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Cardápio Digital (LiveMenu)</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Modos Caixa, Garçom e Cozinha</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Códigos de Fidelidade</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                             <Button className="w-full" asChild>
                                <Link href="/plans?plan=completo">Quero contratar</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* PLANO DIGITAL */}
                    <Card className="flex flex-col rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardHeader className="text-center">
                           <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2"><MonitorPlay /> Digital</CardTitle>
                           <CardDescription>Digitalize seu cardápio e modernize sua operação.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                           <p className="text-4xl font-bold text-center mb-6">R$ 189<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                           <Separator />
                            <ul className="space-y-4 mt-6 text-sm">
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Painel de Admin</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Gestão de Reservas</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Modo Recepção e Fila de Espera</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Análise de Dados (Insights)</li>
                                <li className="flex items-center gap-2"><Check className="text-green-500" /> Cardápio Digital (LiveMenu)</li>
                                <li className="flex items-center gap-2 text-muted-foreground"><X className="text-red-500" /> Modos Caixa, Garçom e Cozinha</li>
                                <li className="flex items-center gap-2 text-muted-foreground"><X className="text-red-500" /> Códigos de Fidelidade</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/plans?plan=digital">Quero contratar</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
        
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
              O Que Nossos Clientes Dizem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                   <div className="flex text-primary mb-2">
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                    </div>
                  <p className="text-muted-foreground mb-4">"Plataforma incrível! Consegui reservar uma mesa para um jantar de última hora sem complicações. Super recomendo!"</p>
                  <p className="font-bold">Ana Souza</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                    <div className="flex text-primary mb-2">
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                    </div>
                  <p className="text-muted-foreground mb-4">"Uso o Chama toda semana para descobrir restaurantes novos. A variedade é ótima e o processo de reserva é muito fácil."</p>
                  <p className="font-bold">Carlos Pereira</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6">
                     <div className="flex text-primary mb-2">
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                        <Star className="w-4 h-4 fill-primary" />
                    </div>
                  <p className="text-muted-foreground mb-4">"O melhor app para quem ama comer fora. Encontro desde lugares badalados até pequenos bistrôs charmosos."</p>
                  <p className="font-bold">Juliana Lima</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
              Sobre o Chama: Mais que Reservas, uma Gestão Completa
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                O Chama nasceu da paixão pela gastronomia e evoluiu para ser o sistema de gestão (PMS) definitivo para restaurantes. Fomos além das simples reservas para criar um ecossistema completo que conecta clientes, gerentes e toda a equipe em uma única plataforma, inteligente e sincronizada.
              </p>
              <p>
                Combinamos uma interface intuitiva com tecnologia de ponta, incluindo IA para automação de tarefas, um sistema de fidelidade com pontos e resgate, e painéis operacionais dedicados para cada função. Acreditamos que, ao simplificar a gestão, liberamos os restaurantes para focarem no que fazem de melhor: criar experiências gastronômicas inesquecíveis.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
