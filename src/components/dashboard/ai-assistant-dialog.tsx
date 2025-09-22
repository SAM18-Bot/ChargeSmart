'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { optimizeChargingSchedule, OptimizeChargingScheduleOutput } from '@/ai/flows/optimize-charging-schedule';
import { EV, Charger } from '@/lib/types';
import { Loader2, Wand2, Zap, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface AiAssistantDialogProps {
  evs: EV[];
  chargers: Charger[];
  pricePerKwh: number;
  chargerPower: number;
}

export function AiAssistantDialog({ evs, chargers, pricePerKwh, chargerPower }: AiAssistantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEv, setSelectedEv] = useState('');
  const [battery, setBattery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizeChargingScheduleOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await optimizeChargingSchedule({
        evModel: selectedEv,
        batteryPercentage: parseInt(battery, 10),
        chargingStationOptions: chargers.map(c => c.id),
        pricing: pricePerKwh,
        chargerPower: chargerPower,
      });
      setResult(response);
    } catch (err) {
      console.error(err);
      setError('Failed to get an optimized schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wand2 className="mr-2 h-4 w-4" />
          Optimize Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">AI Charging Optimizer</DialogTitle>
          <DialogDescription>Let AI find the best and most cost-effective charging plan for you.</DialogDescription>
        </DialogHeader>
        {!result ? (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ev-model" className="text-right">EV Model</Label>
              <Select onValueChange={setSelectedEv} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select your vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {evs.map(ev => (
                    <SelectItem key={ev.model} value={ev.model}>
                      {ev.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="battery" className="text-right">Battery %</Label>
              <Input
                id="battery"
                type="number"
                min="0"
                max="100"
                value={battery}
                onChange={(e) => setBattery(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading || !selectedEv || !battery}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Optimizing...' : 'Get Suggestion'}
            </Button>
            {error && <p className="text-sm text-center text-destructive">{error}</p>}
          </form>
        ) : (
          <div className="py-4 space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-lg text-primary">Your Optimized Plan</h3>
                <p className="text-sm text-foreground">{result.scheduleSuggestion}</p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-accent" />
                        <div>
                            <p className="text-xs text-muted-foreground">Est. Cost</p>
                            <p className="font-bold">₹{result.costEstimate.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-accent" />
                        <div>
                            <p className="text-xs text-muted-foreground">Est. Time</p>
                            <p className="font-bold">{result.estimatedChargingTime}</p>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={() => { setResult(null); setSelectedEv(''); setBattery(''); }} className="w-full">
              Optimize Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
