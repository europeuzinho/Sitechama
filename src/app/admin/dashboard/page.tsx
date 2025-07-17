
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getRestaurants } from "@/lib/restaurants-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardRedirectPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) {
            return;
        }
        
        if (!user) {
            router.push("/login");
            return;
        }
        
        // Super admin should be redirected to their specific dashboard
        if (user.email === "europeueditor@gmail.com") {
            router.push("/admin/super");
            return;
        }

        // Find the restaurant owned by the logged-in user
        const restaurants = getRestaurants();
        const restaurantAdmin = restaurants.find(r => r.ownerEmail === user.email);

        if (restaurantAdmin) {
            // Redirect restaurant owner to their dashboard
            router.push(`/admin/dashboard/${restaurantAdmin.id}`);
        } else {
            // If the user is not a super admin or a restaurant owner,
            // they might be a regular user. Redirect them to their profile.
            router.push("/profile");
        }
    }, [user, loading, router]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
                 <div className="text-center pt-4">
                     <p>Redirecionando para o seu painel...</p>
                 </div>
            </div>
        </div>
    );
}
