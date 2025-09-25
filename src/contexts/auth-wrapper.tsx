
'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Zap } from 'lucide-react';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/about', '/privacy-policy', '/terms-of-service'];
const PROFILE_COMPLETION_ROUTE = '/complete-profile';
const ADMIN_LOGIN_ROUTE = '/admin/login';
const ADMIN_DASHBOARD_ROUTE = '/admin/dashboard';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, admin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_ROUTES.includes(pathname);
    const isProfileCompletion = pathname === PROFILE_COMPLETION_ROUTE;
    const isAdminPage = pathname.startsWith('/admin');

    if (isAdminPage) {
      // Handle Admin routing
      if (pathname === ADMIN_LOGIN_ROUTE && admin) {
        router.push(ADMIN_DASHBOARD_ROUTE);
      } else if (pathname !== ADMIN_LOGIN_ROUTE && !admin) {
        router.push(ADMIN_LOGIN_ROUTE);
      }
    } else {
      // Handle User routing for non-admin pages
      if (!user && !isPublic) {
        router.push('/login');
      } else if (user) {
        if (user.name === 'User' && !isProfileCompletion) {
          router.push(PROFILE_COMPLETION_ROUTE);
        } else if (user.name !== 'User' && (isProfileCompletion || pathname === '/login' || pathname === '/register')) {
          router.push('/dashboard');
        }
      }
    }

  }, [user, admin, loading, pathname, router]);

  if (loading && !PUBLIC_ROUTES.includes(pathname) && pathname !== ADMIN_LOGIN_ROUTE) {
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
