'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChargingOptionsCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export function ChargingOptionsCard({ title, description, onClick }: ChargingOptionsCardProps) {
  return (
    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}>
      <Card className="flex flex-col justify-between h-full transition-all border-2 border-transparent hover:border-primary/50 bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onClick} className="w-full">
            Select <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
