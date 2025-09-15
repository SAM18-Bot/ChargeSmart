'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ChargingOptionsCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export function ChargingOptionsCard({ title, description, onClick }: ChargingOptionsCardProps) {
  return (
    <Card className="flex flex-col justify-between hover:shadow-lg hover:border-primary/50 transition-all">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onClick} className="w-full">
          Select <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
