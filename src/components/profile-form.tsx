
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const USER_PHONE_STORAGE_KEY = 'user-phone-numbers';

const profileFormSchema = z.object({
  displayName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  phoneNumber: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: User;
  onSuccess: () => void;
}

// Helper to get all phone numbers from localStorage
const getAllPhoneNumbers = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const stored = window.localStorage.getItem(USER_PHONE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

// Helper to save phone number to localStorage
const savePhoneNumber = (email: string, phone: string) => {
    if (typeof window === 'undefined') return;
    const allNumbers = getAllPhoneNumbers();
    allNumbers[email] = phone;
    window.localStorage.setItem(USER_PHONE_STORAGE_KEY, JSON.stringify(allNumbers));
}

export function ProfileForm({ user, onSuccess }: ProfileFormProps) {
  const { toast } = useToast();
  const { updateUserProfile } = useAuth();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user.displayName || "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (user.email) {
        const allNumbers = getAllPhoneNumbers();
        form.setValue("phoneNumber", allNumbers[user.email] || "");
    }
     form.setValue("displayName", user.displayName || "");
  }, [user, form]);


  const onSubmit = async (values: ProfileFormData) => {
    try {
      // Update Firebase Auth display name
      if (values.displayName !== user.displayName) {
        await updateUserProfile({ displayName: values.displayName });
      }
      
      // Save phone number to localStorage
      if (user.email && values.phoneNumber) {
        savePhoneNumber(user.email, values.phoneNumber);
      }

      toast({
        title: "Perfil Atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to update profile", error);
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível salvar suas informações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (Opcional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </form>
    </Form>
  );
}
