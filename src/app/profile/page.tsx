'use client';

import { useState } from 'react';
import Header from '@/components/dashboard/header';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Mail, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, you would call an update function from your auth context
    // e.g., `await updateUserProfile({ name });`
    setTimeout(() => {
      toast({
        title: 'Profile Updated!',
        description: 'Your name has been successfully updated.',
      });
      setIsSubmitting(false);
    }, 1000);
  };
  
  if (loading || !user) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">
                {loading ? 'Loading Profile...' : <>Please <Link href="/login" className="text-primary underline">log in</Link> to view this page.</>}
            </p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header user={user} assistantDialog={<div />} />

      <main className="flex-1 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-2xl"
        >
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="text-center items-center">
              <motion.div 
                className="relative mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Avatar className="h-24 w-24 border-4 border-primary">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </motion.div>
              <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2"><User className="w-4 h-4"/> Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4"/> Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                    className="cursor-not-allowed bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">Email addresses cannot be changed.</p>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || name === user.name}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col items-start pt-6 border-t mt-6">
                <h3 className="font-semibold text-lg text-destructive flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Danger Zone</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">These actions are permanent and cannot be undone.</p>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" >Delete My Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => toast({variant: "destructive", title: "Action Not Implemented", description: "Account deletion is not yet available."})}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
