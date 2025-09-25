
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAuth();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await adminLogin(adminId, password);
      if (success) {
        toast({ title: 'Login Successful', description: 'Redirecting to your dashboard.' });
        router.push('/admin/dashboard');
      } else {
        throw new Error('Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 font-body">
      <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-2xl rounded-2xl bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary rounded-full text-primary-foreground">
              <Shield className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-headline text-primary">Admin Portal</CardTitle>
            <CardDescription>Sign in to manage your station</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="adminId">Admin ID</Label>
                <Input
                  id="adminId"
                  placeholder="Enter your Admin ID"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
