'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Charger } from '@/lib/types';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapViewProps {
  chargers: Charger[];
}

export function MapView({ chargers }: MapViewProps) {
  const markerPositions = [
    { top: '25%', left: '30%' },
    { top: '45%', left: '55%' },
    { top: '60%', left: '20%' },
    { top: '75%', left: '70%' },
    { top: '35%', left: '80%' },
    { top: '50%', left: '10%' },
  ];

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-0 relative">
        <div className="aspect-square relative w-full">
          <Image
            src="https://picsum.photos/seed/pune-map/800/800"
            alt="Map of Pune with charger locations"
            data-ai-hint="map satellite"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <TooltipProvider>
          {chargers.map((charger, index) => {
            const position = markerPositions[index % markerPositions.length];
            return (
              <Tooltip key={charger.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: position.top, left: position.left }}
                  >
                    <div className="relative">
                      <Zap
                        className={cn(
                          'h-8 w-8 text-white drop-shadow-lg transition-all duration-300 hover:scale-125',
                          charger.status === 'Available' ? 'fill-green-400' : 'fill-yellow-400'
                        )}
                        strokeWidth={1.5}
                      />
                      {charger.status === 'Occupied' && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">{charger.name}</p>
                  <p>Status: {charger.status}</p>
                  {charger.status === 'Occupied' && <p>Queue: {charger.queue.length}</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
