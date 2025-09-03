'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/header';
import ChargerCard from '@/components/dashboard/charger-card';
import { MapView } from '@/components/dashboard/map-view';
import { chargers as initialChargers, evs as initialEvs } from '@/lib/data';
import type { Charger, EV, User, QueueItem } from '@/lib/types';
import { AiAssistantDialog } from './ai-assistant-dialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DashboardLayout({ user }: { user: User }) {
  const [chargers, setChargers] = useState<Charger[]>(initialChargers);
  const [evs] = useState<EV[]>(initialEvs);
  const [isChargeModalOpen, setChargeModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{ amount: number; chargerName: string } | null>(null);
  const [selectedEvModel, setSelectedEvModel] = useState('');
  const [batteryPercentage, setBatteryPercentage] = useState('');
  const { toast } = useToast();

  const handleOpenChargeModal = (chargerId: string) => {
    setSelectedCharger(chargers.find(c => c.id === chargerId) || null);
    setChargeModalOpen(true);
  };
  
  const handleJoinQueue = (chargerId: string) => {
    setChargers(prevChargers => prevChargers.map(c => {
      if (c.id === chargerId && !c.queue.some(item => item.user.id === user.id)) {
        const newQueueItem: QueueItem = { user, joinTime: new Date() };
        toast({
          title: "Joined Queue",
          description: `You're in the queue for ${c.name}.`,
        });
        return { ...c, queue: [...c.queue, newQueueItem] };
      }
      return c;
    }));
  };

  const handleStartCharging = () => {
    if (!selectedCharger || !selectedEvModel || !batteryPercentage) return;
    
    const kwhNeeded = 50; // Mock calculation
    
    setChargers(prevChargers => prevChargers.map(c => {
      if (c.id === selectedCharger.id) {
        toast({
          title: "Charging Started!",
          description: `Your ${selectedEvModel} is now charging at ${c.name}.`,
        });
        const chargeEndTime = new Date(new Date().getTime() + 30 * 60000); // 30 mins from now
        return {
          ...c,
          status: 'Occupied',
          currentUser: user,
          currentVehicle: { model: selectedEvModel, batteryPercentage: parseInt(batteryPercentage) },
          kwhReserved: kwhNeeded,
          startTime: new Date(),
          estimatedEndTime: chargeEndTime,
        };
      }
      return c;
    }));
    
    setChargeModalOpen(false);
    setSelectedCharger(null);
    setSelectedEvModel('');
    setBatteryPercentage('');
  };

  // Simulate charge completion and payment
  useEffect(() => {
    const interval = setInterval(() => {
      setChargers(prev => {
        const newChargers = [...prev];
        newChargers.forEach((charger, index) => {
          if (charger.status === 'Occupied' && charger.estimatedEndTime && new Date() > charger.estimatedEndTime) {
            // Charging finished
            const cost = (charger.kwhReserved || 50) * 15; // price per kwh
            setPaymentDetails({ amount: cost, chargerName: charger.name });
            setPaymentModalOpen(true);

            // Reset charger or move to next in queue
            const nextInQueue = charger.queue.length > 0 ? charger.queue[0] : null;
            if (nextInQueue) {
              newChargers[index] = {
                ...initialChargers.find(ic => ic.id === charger.id)!,
                id: charger.id,
                name: charger.name,
                status: 'Occupied',
                currentUser: nextInQueue.user,
                // simplified for demo
                currentVehicle: { model: 'Tata Nexon EV', batteryPercentage: 20 },
                kwhReserved: 50,
                startTime: new Date(),
                estimatedEndTime: new Date(new Date().getTime() + 30 * 60000),
                queue: charger.queue.slice(1),
              };
               toast({
                title: "You're up!",
                description: `${nextInQueue.user.name}, it's your turn to charge at ${charger.name}.`,
              });
            } else {
              newChargers[index] = {
                ...initialChargers.find(ic => ic.id === charger.id)!,
                id: charger.id,
                name: charger.name,
              };
            }
          }
        });
        return newChargers;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [toast]);
  
  const handlePayment = () => {
    toast({
      title: "Payment Successful!",
      description: `Thank you for charging with ChargeZen.`,
    });
    setPaymentModalOpen(false);
    setPaymentDetails(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header user={user} assistantDialog={<AiAssistantDialog evs={evs} chargers={chargers} />} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
          <div className="lg:col-span-2 xl:col-span-3">
            <h1 className="text-3xl font-bold font-headline mb-6">Charger Availability</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {chargers.map(charger => (
                <ChargerCard
                  key={charger.id}
                  charger={charger}
                  onStartCharge={handleOpenChargeModal}
                  onJoinQueue={handleJoinQueue}
                  currentUser={user}
                />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 xl:col-span-1">
            <h2 className="text-3xl font-bold font-headline mb-6">Station Map</h2>
            <MapView chargers={chargers} />
          </div>
        </div>
      </main>
      
      {/* Start Charging Modal */}
      <Dialog open={isChargeModalOpen} onOpenChange={setChargeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Start Charging at {selectedCharger?.name}</DialogTitle>
            <DialogDescription>Select your vehicle and confirm details to begin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>EV Model</Label>
                <Select onValueChange={setSelectedEvModel} required>
                    <SelectTrigger><SelectValue placeholder="Select your EV" /></SelectTrigger>
                    <SelectContent>
                        {evs.map(ev => <SelectItem key={ev.model} value={ev.model}>{ev.model}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label>Current Battery %</Label>
                <Input type="number" min="0" max="100" value={batteryPercentage} onChange={e => setBatteryPercentage(e.target.value)} placeholder="e.g., 20" required/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChargeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleStartCharging} disabled={!selectedEvModel || !batteryPercentage}>Confirm & Charge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Payment Required</DialogTitle>
                <DialogDescription>Your charging session at {paymentDetails?.chargerName} is complete.</DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center">
                <p className="text-muted-foreground">Total Amount</p>
                <p className="text-5xl font-bold font-headline text-primary">₹{paymentDetails?.amount.toFixed(2)}</p>
            </div>
            <DialogFooter>
                <Button className="w-full" onClick={handlePayment}>Pay with Razorpay</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
