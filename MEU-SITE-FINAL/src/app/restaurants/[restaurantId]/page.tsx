

"use client";

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getRestaurants, categories, Restaurant, addReview } from "@/lib/restaurants-data";
import { MapPin, Menu, Utensils, Phone, Mail, Star, ExternalLink, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from '@/components/star-rating';
import { ReviewForm } from '@/components/review-form';

export default function RestaurantPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const loadRestaurant = () => {
    const allRestaurants = getRestaurants();
    const foundRestaurant = allRestaurants.find(r => r.id === restaurantId);
    setRestaurant(foundRestaurant);
    setIsLoading(false);
  }

  useEffect(() => {
    loadRestaurant();
    const handleDataChange = () => {
        loadRestaurant();
    };
    
    window.addEventListener('restaurantsChanged', handleDataChange);
    window.addEventListener('reviewsChanged', handleDataChange);
    return () => {
        window.removeEventListener('restaurantsChanged', handleDataChange);
        window.removeEventListener('reviewsChanged', handleDataChange);
    }
  }, [restaurantId]);
  
  const handleReviewSubmit = (rating: number, comment: string) => {
    if (!user || !user.email) {
        toast({ title: "Erro", description: "Você precisa estar logado para avaliar.", variant: "destructive" });
        return;
    }
    if (!restaurant) return;
    addReview(restaurantId, user.uid, user.displayName || 'Anônimo', user.photoURL, rating, comment);
    // Point logic is now handled inside ReviewForm
  };


  if (isLoading) {
     return <div className="flex min-h-screen items-center justify-center"><p>Carregando...</p></div>;
  }
  
  if (!restaurant) {
    notFound();
  }

  const hasLiveMenu = restaurant.plan === 'Digital' || restaurant.plan === 'Completo';
  const categoryInfo = categories[restaurant.category];
  
  const averageRating = restaurant.reviews && restaurant.reviews.length > 0 
    ? (restaurant.reviews.reduce((acc, review) => acc + review.rating, 0) / restaurant.reviews.length)
    : 0;


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/50">
        <div className="relative h-[50vh] w-full">
            <Image
                src={restaurant.image}
                alt={`Foto principal do restaurante ${restaurant.name}`}
                fill
                style={{objectFit: 'cover'}}
                className="brightness-75"
                data-ai-hint="restaurant food"
                priority
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="relative container mx-auto max-w-5xl h-full flex flex-col justify-end p-8 text-white">
                <div className="flex items-end gap-6">
                    {restaurant.logo && (
                        <Image 
                            src={restaurant.logo} 
                            alt={`Logo do ${restaurant.name}`}
                            width={100}
                            height={100}
                            className="bg-white/90 p-2 rounded-lg shadow-lg object-contain hidden md:block"
                            data-ai-hint="restaurant logo" 
                        />
                    )}
                    <div>
                        <h1 className="font-headline text-5xl md:text-7xl font-bold">
                            {restaurant.name}
                        </h1>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                            {categoryInfo && (
                                <span className="font-semibold px-3 py-1 bg-primary/80 text-primary-foreground rounded-full text-sm">{categoryInfo.name}</span>
                            )}
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{restaurant.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <StarRating rating={averageRating} />
                                <span className="font-semibold">{averageRating.toFixed(1)} ({restaurant.reviews?.length || 0} avaliações)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto max-w-5xl py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
               <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="font-headline text-3xl mb-4 flex items-center gap-2">
                                <Utensils className="w-6 h-6 text-primary" />
                                Sobre o Restaurante
                            </h2>
                            <p className="text-muted-foreground whitespace-pre-line">
                                {restaurant.description}
                            </p>
                        </CardContent>
                    </Card>

                     <div>
                         <h2 className="font-headline text-3xl mb-4">Galeria de Fotos</h2>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {restaurant.galleryImages.map((img, index) => (
                                <div key={index} className="relative aspect-square w-full overflow-hidden rounded-lg">
                                    <Image
                                        src={img.url}
                                        alt={`Galeria de fotos do ${restaurant.name} - Imagem ${index + 1}`}
                                        fill
                                        style={{objectFit: 'cover'}}
                                        className="hover:scale-105 transition-transform duration-300"
                                        data-ai-hint={img.hint}
                                    />
                                </div>
                            ))}
                         </div>
                    </div>
                    
                    <Card>
                        <CardHeader className="p-6">
                            <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                <Star className="w-6 h-6 text-primary"/>
                                Avaliações de Clientes
                            </CardTitle>
                             <CardDescription>Veja o que outros clientes estão dizendo e deixe sua opinião.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="mb-8">
                                <ReviewForm onSubmit={handleReviewSubmit} restaurantId={restaurant.id} />
                            </div>

                            <Separator className="mb-8" />
                            
                            <div className="mt-6 space-y-6">
                                {restaurant.reviews && restaurant.reviews.length > 0 ? [...restaurant.reviews].reverse().map(review => (
                                    <div key={review.id}>
                                        <div className="flex items-start gap-4">
                                            <Avatar>
                                                <AvatarImage src={review.userImage || undefined} alt={review.userName} />
                                                <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold">{review.userName}</p>
                                                    <span className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <StarRating rating={review.rating} />
                                                </div>
                                                <p className="text-muted-foreground mt-2">{review.comment}</p>
                                            </div>
                                        </div>
                                        <Separator className="mt-6" />
                                    </div>
                                )) : (
                                    <p className="text-muted-foreground text-center py-4">Este restaurante ainda não tem avaliações. Seja o primeiro a avaliar!</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
               </div>

                <div className="md:col-span-1 sticky top-24 space-y-4">
                    <Card>
                        <CardContent className="p-6">
                           <div className="flex flex-col gap-2">
                                {hasLiveMenu && (
                                    <Button variant="outline" asChild size="lg">
                                        <Link href={`/restaurants/${restaurant.id}/menu`}>
                                            <Menu className="mr-2 h-4 w-4" />
                                            Ver Cardápio
                                        </Link>
                                    </Button>
                                )}
                                <Button className="w-full" size="lg" asChild>
                                    <Link href={`/reservations?restaurantId=${restaurant.id}`}>Reservar Mesa</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                     {restaurant.cakeOrderSettings?.enabled && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl flex items-center gap-2"><Cake className="text-primary"/> {restaurant.cakeOrderSettings.name}</CardTitle>
                                <CardDescription>Deixe sua celebração ainda mais doce. Encomende com antecedência.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">Pagamento antecipado via Pix. Encomendas devem ser feitas com pelo menos 48h de antecedência da data da reserva.</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="secondary" asChild>
                                    <Link href={`/restaurants/${restaurant.id}/order-cake`}>Encomendar Bolo</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-headline text-xl">Informações</h3>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold">Endereço</h4>
                                    <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold">Telefone</h4>
                                    <p className="text-sm text-muted-foreground">{restaurant.phone}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold">SAC</h4>
                                    <p className="text-sm text-muted-foreground">{restaurant.sac}</p>
                                </div>
                            </div>
                            <Button asChild className="w-full" variant="outline">
                                <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer">
                                    Ver no Google Maps
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
