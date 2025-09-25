'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calculator, Zap, CalendarClock } from 'lucide-react';

interface ChargingOptionsCardProps {
  title: string;
  description: string;
  onClick: () => void;
  variant: 'smart' | 'direct' | 'book';
}

export function ChargingOptionsCard({ title, description, onClick, variant }: ChargingOptionsCardProps) {

  const variants = {
    smart: {
      bg: 'bg-card-smart-bg',
      shadow: '[--shadow-color:210,40%,56%]',
      button: 'bg-white/10 text-white border-white/20 hover:bg-white/20',
      icon: <Calculator className="h-8 w-8 text-white/80" />
    },
    direct: {
      bg: 'bg-card-direct-bg',
      shadow: '[--shadow-color:142,71%,45%]',
      button: 'bg-white/10 text-white border-white/20 hover:bg-white/20',
      icon: <Zap className="h-8 w-8 text-white/80" />
    },
    book: {
      bg: 'bg-card-book-bg',
      shadow: '[--shadow-color:262,83%,60%]',
      button: 'bg-white/10 text-white border-white/20 hover:bg-white/20',
      icon: <CalendarClock className="h-8 w-8 text-white/80" />
    },
  };

  const selectedVariant = variants[variant];

  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(var(--shadow-color), 0.1), 0 4px 6px -2px rgba(var(--shadow-color), 0.05)" }}
      className={cn('rounded-lg', selectedVariant.shadow)}
    >
      <Card className={cn("flex flex-col justify-between h-full transition-all border-0 text-white p-6", selectedVariant.bg)}>
        <div>
            <div className="mb-4">{selectedVariant.icon}</div>
            <CardHeader className="p-0">
                <CardTitle className="font-headline text-xl text-white">{title}</CardTitle>
                <CardDescription className="text-white/80 mt-2">{description}</CardDescription>
            </CardHeader>
        </div>
        <CardFooter className="p-0 mt-6">
          <Button onClick={onClick} variant="outline" className={cn("w-full border", selectedVariant.button)}>
            Select
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
