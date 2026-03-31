
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

    const currentPath = pathname ?? '/';
    const isPublic = PUBLIC_ROUTES.includes(currentPath);
    const isProfileCompletion = currentPath === PROFILE_COMPLETION_ROUTE;
    const isAdminPage = currentPath.startsWith('/admin');

    if (isAdminPage) {
      // Handle Admin routing
      if (currentPath === ADMIN_LOGIN_ROUTE && admin) {
        router.push(ADMIN_DASHBOARD_ROUTE);
      } else if (currentPath !== ADMIN_LOGIN_ROUTE && !admin) {
        router.push(ADMIN_LOGIN_ROUTE);
      }
    } else {
      // Handle User routing for non-admin pages
      if (!user && !isPublic) {
        router.push('/login');
      } else if (user) {
        if (user.name === 'User' && !isProfileCompletion) {
          router.push(PROFILE_COMPLETION_ROUTE);
        } else if (user.name !== 'User' && (isProfileCompletion || currentPath === '/login' || currentPath === '/register')) {
          router.push('/dashboard');
        }
      }
    }

  }, [user, admin, loading, pathname, router]);

  // We only show a global loader for non-public pages and non-admin pages
  // to avoid flashes of the loader on public routes.
  const currentPath = pathname ?? '/';
  const showLoader = loading && !PUBLIC_ROUTES.includes(currentPath) && !currentPath.startsWith('/admin');

  if (showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="flex items-center space-x-4">
          <Zap className="h-12 w-12 text-primary animate-pulse" />
          <h1 className="text-4xl font-headline font-bold text-primary">ChargeSmart</h1>
        </div>
        <p className="mt-4 text-muted-foreground">Loading your session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
