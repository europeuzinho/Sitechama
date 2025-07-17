
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, HelpCircle, X, TrendingUp, ShieldCheck, Combine, Rocket, Cpu, Database, Palette, MonitorPlay, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'insights',
    name: 'Insights',
    icon: BarChart2,
    price: 'R$ 99',
    description: 'Organize, gerencie e analise suas reservas e clientes.',
    features: [
      { text: 'Painel de Admin', included: true },
      { text: 'Gestão de Reservas', included: true },
      { text: 'Modo Recepção e Fila de Espera', included: true },
      { text: 'Análise de Dados (Insights)', included: true },
      { text: 'Cardápio Digital (LiveMenu)', included: false },
      { text: 'Modos Caixa, Garçom e Cozinha (KDS)', included: false },
      { text: 'Códigos de Fidelidade', included: false },
      { text: 'Suporte Básico', included: true },
    ],
  },
  {
    id: 'completo',
    name: 'Completo',
    icon: Combine,
    price: 'R$ 299',
    description: 'A solução definitiva para gestão e operação completa do seu negócio.',
    isRecommended: true,
    features: [
      { text: 'Painel de Admin', included: true },
      { text: 'Gestão de Reservas', included: true },
      { text: 'Modo Recepção e Fila de Espera', included: true },
      { text: 'Análise de Dados (Insights)', included: true },
      { text: 'Cardápio Digital (LiveMenu)', included: true },
      { text: 'Modos Caixa, Garçom e Cozinha (KDS)', included: true },
      { text: 'Códigos de Fidelidade', included: true },
      { text: 'Suporte Prioritário', included: true },
    ],
  },
  {
    id: 'digital',
    name: 'Digital',
    icon: MonitorPlay,
    price: 'R$ 189',
    description: 'Digitalize seu cardápio e modernize a experiência do cliente.',
    features: [
      { text: 'Painel de Admin', included: true },
      { text: 'Gestão de Reservas', included: true },
      { text: 'Modo Recepção e Fila de Espera', included: true },
      { text: 'Análise de Dados (Insights)', included: true },
      { text: 'Cardápio Digital (LiveMenu)', included: true },
      { text: 'Modos Caixa, Garçom e Cozinha (KDS)', included: false },
      { text: 'Códigos de Fidelidade', included: false },
      { text: 'Suporte Padrão', included: true },
    ],
  },
];

const faqItems = [
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer: "Sim! Você pode fazer o upgrade ou downgrade do seu plano a qualquer momento diretamente pelo seu painel de administrador. A cobrança será ajustada pro-rata no ciclo seguinte.",
  },
  {
    question: "Existe algum contrato de fidelidade?",
    answer: "Não. Nossos planos são mensais e você pode cancelar quando quiser, sem multas ou taxas de cancelamento. Acreditamos na qualidade do nosso serviço para manter você conosco.",
  },
  {
    question: "Como funciona o suporte prioritário do Plano Completo?",
    answer: "Assinantes do Plano Completo têm acesso a um canal de suporte exclusivo via WhatsApp e telefone, com tempo de resposta reduzido, garantindo que qualquer problema seja resolvido com a máxima agilidade.",
  },
  {
    question: "O que é o Cardápio Digital Interativo (LiveMenu)?",
    answer: "É uma versão online e moderna do seu cardápio, acessível via QR code. Você pode atualizar pratos, preços e fotos em tempo real através do painel, sem precisar reimprimir menus. Ele também permite que seus clientes vejam mais detalhes sobre cada prato.",
  },
   {
    question: "Como funciona o Sistema de Pontos e Códigos de Resgate?",
    answer: "Seus clientes ganham pontos por reservar e avaliar. Com o Plano Completo, você pode gerar códigos únicos (para imprimir na nota fiscal, por exemplo) que seus clientes resgatam no perfil deles para ganhar mais pontos, incentivando a fidelidade e o retorno.",
  },
];

const techFeatures = [
    {
        icon: Rocket,
        title: "Tecnologia de Ponta",
        description: "Construído com Next.js e React, nosso sistema oferece uma experiência de usuário ultrarrápida e responsiva, tanto para seus clientes quanto para sua equipe."
    },
    {
        icon: ShieldCheck,
        title: "Segurança Robusta",
        description: "Utilizamos a autenticação segura do Firebase para proteger os dados de acesso. Todas as informações são armazenadas de forma segura e local, sem depender de bancos de dados externos."
    },
    {
        icon: Cpu,
        title: "Inteligência Artificial Genkit",
        description: "Automatize tarefas com o poder da IA do Google. Gere descrições de restaurantes e notificações de pedidos de forma inteligente, economizando tempo e garantindo profissionalismo."
    },
    {
        icon: Palette,
        title: "Interface Moderna e Intuitiva",
        description: "Nossos painéis são desenhados com ShadCN UI e Tailwind CSS, garantindo uma interface limpa, bonita e fácil de usar em qualquer dispositivo, do celular ao desktop."
    },
    {
        icon: Database,
        title: "Gestão de Dados Simplificada",
        description: "Toda a gestão de reservas, cardápios e clientes é feita de forma local no navegador. Isso significa mais velocidade, privacidade e total controle sobre seus dados operacionais."
    }
];

function PlansContent() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan');

  const orderedPlans = [
      plans.find(p => p.id === 'insights'),
      plans.find(p => p.id === 'completo'),
      plans.find(p => p.id === 'digital'),
  ].filter(Boolean) as typeof plans;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/50">
        <div className="container mx-auto max-w-7xl py-12 md:py-24">
          <div className="text-center mb-16">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
              Escolha o Plano Perfeito para o seu Sucesso
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Temos a solução ideal para cada etapa do seu negócio, desde a análise de dados até a digitalização completa do seu atendimento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {orderedPlans.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selectedPlan === plan.id;
                return (
                    <Card key={plan.id} className={cn("flex flex-col rounded-2xl transition-all duration-300", plan.isRecommended ? "border-primary border-2 bg-gradient-to-br from-primary/20 to-primary/10" : "bg-gradient-to-br from-primary/10 to-primary/5", isSelected && "ring-2 ring-primary scale-105")}>
                        {plan.isRecommended && <Badge className="absolute -top-4 right-1/2 translate-x-1/2">Recomendado</Badge>}
                        <CardHeader className="text-center">
                            <CardTitle className={cn("font-headline text-3xl flex items-center justify-center gap-2", plan.isRecommended && "text-primary")}><Icon /> {plan.name}</CardTitle>
                            <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-5xl font-bold text-center mb-6">{plan.price}<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                            <Separator />
                            <ul className="space-y-4 mt-6 text-sm">
                                {plan.features.map(feature => (
                                    <li key={feature.text} className={cn("flex items-center gap-3", !feature.included && "text-muted-foreground")}>
                                        {feature.included ? <Check className="h-5 w-5 text-green-500 flex-shrink-0" /> : <X className="h-5 w-5 text-red-500 flex-shrink-0" />}
                                        <span>{feature.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className={cn("w-full", !plan.isRecommended && "variant-outline")} asChild size="lg">
                                <Link href={`/signup?plan=${plan.id}`}>Contratar Agora</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
          </div>

           <div className="mt-24">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Nossa Tecnologia a seu Favor</h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Entenda por que o Chama é a plataforma mais moderna e segura para o seu restaurante.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {techFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div key={feature.title} className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{feature.title}</h3>
                                    <p className="mt-1 text-muted-foreground text-sm">{feature.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
           </div>

          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl md:text-4xl font-bold flex items-center justify-center gap-3">
                    <HelpCircle className="h-8 w-8 text-primary" />
                    Perguntas Frequentes
                </h2>
                <p className="mt-2 text-muted-foreground">Tudo o que você precisa saber antes de contratar.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground">
                          {item.answer}
                      </AccordionContent>
                  </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PlansPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <PlansContent />
        </Suspense>
    )
}
