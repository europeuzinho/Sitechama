
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { User, LogOut, LayoutDashboard, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth';
import { getRestaurants } from '@/lib/restaurants-data';
import { getInitials } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useEffect, useState } from 'react';
import { getSiteConfig, SiteConfig } from '@/lib/site-config-store';

function Logo() {
    const [config, setConfig] = useState<SiteConfig | null>(null);

    useEffect(() => {
        setConfig(getSiteConfig());
    }, []);

    const logoUrl = config?.logoUrl || 'https://i.ibb.co/1tSct3B/fc02aff7-210b-4f62-9c1b-09622c195968.png';

    return (
        <Image
            src={logoUrl}
            alt="Logo"
            width={32}
            height={32}
            priority
            data-ai-hint="logo"
        />
    );
}

export function Header() {
  const { user, loading, logout, isImpersonating, revertImpersonation } = useAuth();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  
   useEffect(() => {
        const loadConfig = () => setConfig(getSiteConfig());
        loadConfig(); // Initial load
        window.addEventListener('siteConfigChanged', loadConfig); // Listen for changes
        return () => window.removeEventListener('siteConfigChanged', loadConfig);
    }, []);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.email === "europeueditor@gmail.com") {
      return "/admin/super";
    }
    
    const restaurants = getRestaurants();
    const restaurantAdmin = restaurants.find(r => r.ownerEmail === user.email);

    if (restaurantAdmin) {
      return `/admin/dashboard/${restaurantAdmin.id}`;
    }
    return "/profile";
  }

  const siteName = config?.siteName || 'Chama';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {isImpersonating && (
        <div className="bg-yellow-500 text-black text-center text-sm py-1.5 px-4 flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-semibold">Modo de Visualização:</span> 
            Você está vendo o painel como {user?.displayName || user?.email}.
            <Button variant="link" className="text-black h-auto p-0 ml-2" onClick={revertImpersonation}>
                Sair do modo de visualização
            </Button>
        </div>
      )}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-headline text-2xl font-bold">{siteName}</span>
        </Link>
        <div className="flex items-center gap-4">
          {loading ? (
             <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName || 'Usuário'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Usuário'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Painel</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                   <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
               <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Cadastre-se</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
