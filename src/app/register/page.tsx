
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail, updateUserProfile, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerWithEmail(email, password);
      toast({
          title: "Account Created!",
          description: "Welcome to ChargeSmart. Please complete your profile."
      });
      // This is the key change: ensure modal is shown
      setShowProfileModal(true); 
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'Could not create an account. Please try again.',
      });
      setIsSubmitting(false);
    }
    // We keep isSubmitting true until profile is also submitted
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // No need to set isSubmitting to true again, it's already true
    try {
        await updateUserProfile({ name, contactNumber });
        toast({
            title: "Profile Complete!",
            description: "You're all set. Welcome to the dashboard."
        });
        setShowProfileModal(false);
        router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Profile Update Failed',
            description: error.message || 'Could not save your profile. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  // We don't want to redirect if a new user is in the process of completing their profile
  if (user && !showProfileModal) {
    router.push('/dashboard');
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <div className="flex items-center space-x-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <p className="mt-4 text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
    );
  }

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-background p-4 font-body">
      <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-2xl rounded-2xl bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
             <Link href="/" className="mx-auto">
              <motion.div 
                  className="mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                <Logo />
              </motion.div>
             </Link>
            <CardTitle className="text-3xl font-headline text-primary">Create an Account</CardTitle>
            <CardDescription>Join ChargeSmart today!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  name="email"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  name="password"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full font-bold bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </form>

            <p className="mt-6 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    <Dialog open={showProfileModal} onOpenChange={(open) => { if (!open) { setIsSubmitting(false); setShowProfileModal(false); }}}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Complete Your Profile</DialogTitle>
                <DialogDescription>Just a couple more things to get you started.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="profile-name" className="text-right">Full Name</Label>
                        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact-number" className="text-right">Contact No.</Label>
                        <Input id="contact-number" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="col-span-3" required />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting && !showProfileModal}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save and Continue
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}