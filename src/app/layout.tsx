// ARQUIVO PRINCIPAL: O MOLDE DO SITE
// Este arquivo é o "molde" do seu site. O cabeçalho (Header), o rodapé (Footer) e as fontes que aparecem em **todas as páginas** são controlados por ele.
// É a "moldura" que envolve todas as páginas do seu site.
import type { Metadata } from 'next';
import { Montserrat, PT_Sans } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from "@/components/theme-provider";
import './globals.css';
import { cn } from '@/lib/utils';


const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-montserrat',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Chama - Reservas Fáceis de Restaurantes',
  description: 'Reserve sua mesa nos melhores restaurantes da sua cidade.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
      </head>
      <body className={cn(
        "font-body antialiased",
        montserrat.variable,
        ptSans.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
