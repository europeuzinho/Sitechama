
'use client';

import { Suspense } from 'react';
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "@/components/signup-form";

function SignupContent() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Crie sua conta de parceiro</CardTitle>
          <CardDescription>
            Insira suas informações para se cadastrar e escolher seu plano.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


export default function SignupPage() {
  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
        <SignupContent />
    </Suspense>
  )
}
