
'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Zap } from 'lucide-react';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/about', '/privacy-policy', '/terms-of-service'];
const PROFILE_COMPLETION_ROUTE = '/complete-profile';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_ROUTES.includes(pathname);
    const isProfileCompletion = pathname === PROFILE_COMPLETION_ROUTE;

    if (!user && !isPublic) {
      router.push('/login');
    } else if (user) {
      // If user is new (name is default 'User'), force them to complete profile
      if (user.name === 'User' && !isProfileCompletion) {
        router.push(PROFILE_COMPLETION_ROUTE);
      }
      // If user has completed profile but is on the completion page, redirect to dashboard
      else if (user.name !== 'User' && isProfileCompletion) {
        router.push('/dashboard');
      }
    }

  }, [user, loading, pathname, router]);

  if (loading && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="flex items-center space-x-4">
          <Zap className="h-12 w-12 text-primary animate-pulse" />
          <h1 className="text-4xl font-headline font-bold text-primary">ChargeSmart</h1>
        </div>
        <p className="mt-4 text-muted-foreground">Securing your session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
