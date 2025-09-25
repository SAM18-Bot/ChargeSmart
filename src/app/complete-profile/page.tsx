
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Phone, AtSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, updateUserProfile, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If user lands here but already has a full name, redirect to dashboard.
    // This handles cases where they try to access this page manually after completion.
    if (user && user.name && user.name !== 'User') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateUserProfile({ name: fullName, contactNumber });
      toast({
        title: "Profile Complete!",
        description: "You're all set. Welcome to the dashboard."
      });
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
  };

  if (loading || !user) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">{loading ? 'Loading...' : 'Redirecting...'}</p>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 font-body">
      <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-2xl rounded-2xl bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <motion.div 
              className="mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Logo />
            </motion.div>
            <CardTitle className="text-3xl font-headline text-primary">Complete Your Profile</CardTitle>
            <CardDescription>Just a couple more things to get you started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email" className='flex items-center gap-2'><AtSign className='w-4 h-4' /> Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="cursor-not-allowed bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName" className='flex items-center gap-2'><User className='w-4 h-4' /> Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g., Sameer Bansode"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  name="fullName"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber" className='flex items-center gap-2'><Phone className='w-4 h-4' /> Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="e.g., 9876543210"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  disabled={isSubmitting}
                  name="contactNumber"
                  autoComplete="tel"
                />
              </div>
              <Button type="submit" className="w-full font-bold bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save and Continue to Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
