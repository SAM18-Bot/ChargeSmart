
'use client';

import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/lib/types';
import { LifeBuoy, LogOut, User as UserIcon, History, Info } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ThemeToggle } from '../theme-toggle';

interface HeaderProps {
  user: User;
  assistantDialog: React.ReactNode;
}

export default function Header({ user, assistantDialog }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-primary/10 bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Logo />
        <span className="text-xl font-bold font-headline tracking-tighter text-primary">ChargeSmart</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        {assistantDialog}
        <Button variant="ghost" asChild>
            <Link href="/about">
                <Info className="mr-2 h-4 w-4" /> About Us
            </Link>
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary/50">
                <AvatarImage src={user.photoURL} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/history">
                <History className="mr-2 h-4 w-4" />
                <span>History</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent cursor-default">
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>sameerbansode001@gmail.com</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
