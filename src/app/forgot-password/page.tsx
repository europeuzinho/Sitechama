import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Esqueceu a senha?</CardTitle>
          <CardDescription>
            Sem problemas. Insira seu e-mail e enviaremos um link para você redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
          <div className="mt-4 text-center text-sm">
            Lembrou a senha?{" "}
            <Link href="/login" className="underline">
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
