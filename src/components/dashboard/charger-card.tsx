'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Charger, User } from '@/lib/types';
import { Zap, Users, Loader2, BatteryCharging, Hourglass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { estimateTimeTillEmpty } from '@/ai/flows/estimate-time-till-empty';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChargerCardProps {
  charger: Charger;
  onCharge: (chargerId: string) => void;
  onJoinQueue: (chargerId: string) => void;
  currentUser: User;
}

export default function ChargerCard({ charger, onCharge, onJoinQueue, currentUser }: ChargerCardProps) {
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [isLoadingTime, setIsLoadingTime] = useState(false);
  
  const isCurrentUserCharging = charger.status === 'Occupied' && charger.currentUser?.id === currentUser.id;
  const isCurrentUserInQueue = charger.queue.some(item => item.user.id === currentUser.id);

  const fetchEstimate = () => {
    if (charger.status === 'Occupied' && charger.currentUser && charger.currentVehicle) {
      setIsLoadingTime(true);
      estimateTimeTillEmpty({
        chargerId: charger.id,
        currentKwh: charger.kwhReserved || 50,
        vehicleModel: charger.currentVehicle.model,
        batteryPercentage: charger.currentVehicle.batteryPercentage || 20,
        reservedKwh: charger.kwhReserved || 50
      }).then(response => {
        setEstimatedTime(response.estimatedTimeTillEmpty);
      }).catch(err => {
        console.error("Failed to estimate time:", err);
        setEstimatedTime('~ 45 mins'); // Fallback estimate
      }).finally(() => {
        setIsLoadingTime(false);
      });
    }
  };

  useEffect(() => {
    if (charger.status === 'Occupied') {
      fetchEstimate();
      // Set up an interval to re-fetch the estimate every 30 seconds
      const interval = setInterval(fetchEstimate, 30000); 
      // Clear the interval when the component unmounts or dependencies change
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charger.status, charger.id]);


  const getBadgeVariant = (status: 'Available' | 'Occupied') => {
    switch (status) {
      case 'Available':
        return 'bg-green-500 text-white';
      case 'Occupied':
        return 'bg-yellow-500 text-black';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl">{charger.name}</CardTitle>
          <Badge className={cn('text-xs', getBadgeVariant(charger.status))}>{charger.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          {charger.status === 'Available' ? (
            <div className="flex flex-col items-center justify-center text-center h-full py-8">
              <Zap className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-muted-foreground">Ready for your EV.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">{charger.currentUser?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{charger.currentUser?.name}</p>
                    <p className="text-sm text-muted-foreground">{charger.currentVehicle?.model}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <BatteryCharging className="mr-2 h-4 w-4 text-primary" />
                <span>Charging in progress...</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                {isLoadingTime && !estimatedTime ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Hourglass className="mr-2 h-4 w-4 text-yellow-500" />}
                <span>
                  {isLoadingTime && !estimatedTime ? 'Estimating time...' : `Free in approx. ${estimatedTime || 'N/A'}`}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold">Queue ({charger.queue.length})</h4>
            </div>
            {charger.queue.length > 0 ? (
              <div className="space-y-2 pl-2 max-h-24 overflow-y-auto">
                {charger.queue.map((item, index) => (
                  <div key={item.user.id} className="flex items-center space-x-2 text-sm">
                    <span className="font-mono text-muted-foreground">{index + 1}.</span>
                     <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-secondary">{item.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className={cn(item.user.id === currentUser.id && 'font-bold text-primary')}>{item.user.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pl-6">No one is waiting.</p>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          {charger.status === 'Available' ? (
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold" onClick={() => onCharge(charger.id)} disabled={isCurrentUserCharging || isCurrentUserInQueue}>
              Charge Now
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button variant="outline" className="w-full" onClick={() => onJoinQueue(charger.id)} disabled={isCurrentUserCharging || isCurrentUserInQueue}>
                      Join Queue
                    </Button>
                  </div>
                </TooltipTrigger>
                {(isCurrentUserCharging || isCurrentUserInQueue) && 
                  <TooltipContent>
                    <p>You are already charging or in a queue.</p>
                  </TooltipContent>
                }
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
