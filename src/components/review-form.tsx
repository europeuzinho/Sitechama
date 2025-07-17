
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getRestaurants } from "@/lib/restaurants-data";
import { useToast } from "@/hooks/use-toast";
import { addUserPoints } from "@/lib/points-store";

const reviewSchema = z.object({
  comment: z.string().min(10, { message: "Seu comentário deve ter pelo menos 10 caracteres." }),
  rating: z.number().min(1, { message: "Por favor, selecione uma avaliação." }),
});

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void;
  restaurantId: string;
}

export function ReviewForm({ onSubmit, restaurantId }: ReviewFormProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const restaurant = getRestaurants().find(r => r.id === restaurantId);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comment: "",
      rating: 0,
    },
  });

  const rating = form.watch("rating");

  const handleFormSubmit = (values: z.infer<typeof reviewSchema>) => {
    if (!user || !user.uid) return;
    onSubmit(values.rating, values.comment);
    addUserPoints(user.uid, 5, `Avaliação em ${restaurant?.name}`);
    toast({ title: "Avaliação Enviada!", description: "Obrigado pelo seu feedback! Você ganhou 5 pontos." });
    form.reset();
  };
  
  if (!user) {
    return (
        <div className="border p-4 rounded-lg bg-secondary text-center text-muted-foreground">
            <p>Você precisa estar logado para deixar uma avaliação.</p>
        </div>
    )
  }
  
  const userHasReviewed = restaurant?.reviews?.some(r => r.userId === user.uid);

  if (userHasReviewed) {
    return (
        <div className="border p-4 rounded-lg bg-secondary text-center text-muted-foreground">
            <p>Você já avaliou este restaurante. Obrigado pelo seu feedback!</p>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sua Avaliação</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-6 h-6 cursor-pointer transition-colors",
                        (hoverRating >= star || rating >= star)
                          ? "text-primary fill-primary"
                          : "text-gray-300"
                      )}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => field.onChange(star)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seu Comentário</FormLabel>
              <FormControl>
                <Textarea placeholder="Conte-nos sobre sua experiência..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enviar Avaliação</Button>
      </form>
    </Form>
  );
}
