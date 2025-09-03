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
import Chatbot from '../chatbot/chatbot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { add, format, set } from 'date-fns';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Ticket } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PRICE_PER_KWH = 18; // Rupees per kWh
const CHARGER_POWER_KW = 22; // kW

export default function DashboardLayout({ user }: { user: User }) {
  const [chargers, setChargers] = useState<Charger[]>(initialChargers);
  const [evs] = useState<EV[]>(initialEvs);
  const [isChargeModalOpen, setChargeModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{ amount: number; chargerName: string } | null>(null);
  
  // Charge Modal State
  const [selectedEvModel, setSelectedEvModel] = useState('');
  const [batteryPercentage, setBatteryPercentage] = useState('');
  const [kwhAmount, setKwhAmount] = useState('');
  const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
  const [bookingTime, setBookingTime] = useState<string>('');
  
  const { toast } = useToast();

  const handleOpenChargeModal = (chargerId: string) => {
    const charger = chargers.find(c => c.id === chargerId);
    if(charger) {
        setSelectedCharger(charger);
        setChargeModalOpen(true);
    }
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

  const handleSmartCharge = () => {
    if (!selectedCharger || !selectedEvModel || !batteryPercentage) return;
    
    const selectedEVObject = evs.find(ev => ev.model === selectedEvModel);
    if (!selectedEVObject) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected EV model not found.'});
      return;
    }

    const currentBattery = parseInt(batteryPercentage, 10);
    const kwhNeeded = ((100 - currentBattery) / 100) * selectedEVObject.batteryCapacity;
    const chargeTimeMinutes = Math.round((kwhNeeded / CHARGER_POWER_KW) * 60);

    setChargers(prevChargers => prevChargers.map(c => {
      if (c.id === selectedCharger.id) {
        toast({
          title: "Smart Charging Started!",
          description: `Your ${selectedEvModel} will charge for approximately ${chargeTimeMinutes} minutes.`,
        });
        const chargeEndTime = add(new Date(), { minutes: chargeTimeMinutes });
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
    
    closeAndResetModal();
  };

  const handleDirectCharge = () => {
    if (!selectedCharger || !kwhAmount) return;
    
    const kwh = parseInt(kwhAmount, 10);
    if (isNaN(kwh) || kwh <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid kWh amount.'});
      return;
    }

    const chargeTimeMinutes = Math.round((kwh / CHARGER_POWER_KW) * 60);

     setChargers(prevChargers => prevChargers.map(c => {
      if (c.id === selectedCharger.id) {
        toast({
          title: "Direct Charging Started!",
          description: `Charging ${kwh} kWh. This will take about ${chargeTimeMinutes} minutes.`,
        });
        const chargeEndTime = add(new Date(), { minutes: chargeTimeMinutes });
        return {
          ...c,
          status: 'Occupied',
          currentUser: user,
          currentVehicle: { model: 'Direct kWh Charge' },
          kwhReserved: kwh,
          startTime: new Date(),
          estimatedEndTime: chargeEndTime,
        };
      }
      return c;
    }));
    
    closeAndResetModal();
  }

  const handleBooking = () => {
    if (!selectedCharger || !bookingDate || !bookingTime) return;

    const [hours, minutes] = bookingTime.split(':').map(Number);
    const bookingStart = set(bookingDate, { hours, minutes });
    
    toast({
        title: "Slot Booked!",
        description: `You have booked ${selectedCharger.name} for ${format(bookingStart, "MMM d, yyyy 'at' h:mm a")}.`,
    });
    
    // In a real app, you would save this booking to a backend and update the charger's availability.
    // For this demo, we'll just show the toast.
    
    closeAndResetModal();
  }

  const closeAndResetModal = () => {
    setChargeModalOpen(false);
    setSelectedCharger(null);
    setSelectedEvModel('');
    setBatteryPercentage('');
    setKwhAmount('');
    setBookingDate(new Date());
    setBookingTime('');
  }


  // Simulate charge completion and payment
  useEffect(() => {
    const interval = setInterval(() => {
      setChargers(prev => {
        const newChargers = [...prev];
        newChargers.forEach((charger, index) => {
          if (charger.status === 'Occupied' && charger.estimatedEndTime && new Date() > charger.estimatedEndTime) {
            // Charging finished
            const cost = (charger.kwhReserved || 0) * PRICE_PER_KWH; 
            if (charger.currentUser?.id === user.id) {
              setPaymentDetails({ amount: cost, chargerName: charger.name });
              setPaymentModalOpen(true);
            }

            // Reset charger or move to next in queue
            const nextInQueue = charger.queue.length > 0 ? charger.queue[0] : null;
            if (nextInQueue) {
              // A simple representation of the next user's charge
              const nextKwh = 30; // Assume next user wants 30kWh
              const nextChargeTime = Math.round((nextKwh / CHARGER_POWER_KW) * 60);

              newChargers[index] = {
                ...initialChargers.find(ic => ic.id === charger.id)!,
                id: charger.id,
                name: charger.name,
                status: 'Occupied',
                currentUser: nextInQueue.user,
                currentVehicle: { model: 'Tata Nexon EV', batteryPercentage: 20 },
                kwhReserved: nextKwh,
                startTime: new Date(),
                estimatedEndTime: new Date(new Date().getTime() + nextChargeTime * 60000),
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);
  
  const handlePayment = async () => {
    if (!paymentDetails || paymentDetails.amount <= 0) {
       toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Invalid payment amount.',
      });
      // Also close the payment modal and generate a free ticket if charge was 0
      setPaymentModalOpen(false);
      generateQrTicket(true); // isFree = true
      return;
    };

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: paymentDetails.amount * 100 }), // Amount in paise
      });
      
      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ChargeSmart',
        description: `Payment for charging at ${paymentDetails.chargerName}`,
        order_id: order.id,
        handler: async (response: any) => {
          toast({
            title: "Payment Successful!",
            description: `Thank you for charging with ChargeSmart. Your payment ID is ${response.razorpay_payment_id}.`,
          });
          generateQrTicket();
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#5B21B6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: 'Could not initiate payment. Please try again.',
      });
    }
  }

  const generateQrTicket = async (isFree = false) => {
    if (!paymentDetails) return;
     // Generate QR Code
    const ticketData = {
      charger: paymentDetails.chargerName,
      user: user.name,
      email: user.email,
      amount: isFree ? '0.00' : paymentDetails.amount.toFixed(2),
      date: format(new Date(), "PPpp"),
      transactionId: `CS-${Date.now()}`
    };

    try {
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData), {
        errorCorrectionLevel: 'H',
        type: 'image/jpeg',
        quality: 0.9,
        margin: 1,
        color: {
          dark:"#29003D",
          light:"#FFFFFF"
        }
      });
      setQrCodeData(qrDataUrl);
      setQrModalOpen(true);
    } catch (err) {
      console.error('Failed to generate QR code', err);
      toast({
        variant: 'destructive',
        title: "QR Generation Failed",
        description: "Could not generate your ticket. Please contact support."
      })
    }

    setPaymentModalOpen(false);
    setPaymentDetails(null);
  }
  
  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const totalMinutes = i * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  });

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
                  onCharge={handleOpenChargeModal}
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
      
      <Chatbot />
      
      {/* Charging Options Modal */}
      <Dialog open={isChargeModalOpen} onOpenChange={closeAndResetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Charge at {selectedCharger?.name}</DialogTitle>
            <DialogDescription>Select your preferred charging method.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="smart" className="w-full pt-4">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="smart">Smart Charge</TabsTrigger>
                <TabsTrigger value="direct">Direct kWh</TabsTrigger>
                <TabsTrigger value="book">Book a Slot</TabsTrigger>
            </TabsList>
            {/* Smart Charge: Based on Vehicle & Battery */}
            <TabsContent value="smart">
                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">Let us optimize charging based on your car's needs.</p>
                    <div className="space-y-2">
                        <Label>EV Model</Label>
                        <Select onValueChange={setSelectedEvModel} value={selectedEvModel} required>
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
                    <Button variant="outline" onClick={closeAndResetModal}>Cancel</Button>
                    <Button onClick={handleSmartCharge} disabled={!selectedEvModel || !batteryPercentage}>Confirm & Charge</Button>
                </DialogFooter>
            </TabsContent>
            {/* Direct Charge: Based on kWh */}
            <TabsContent value="direct">
                <div className="space-y-4 py-4">
                     <p className="text-sm text-muted-foreground">Specify the exact amount of electricity you need (₹{PRICE_PER_KWH}/kWh).</p>
                    <div className="space-y-2">
                        <Label>kWh to Charge</Label>
                        <Input type="number" min="1" max="100" value={kwhAmount} onChange={e => setKwhAmount(e.target.value)} placeholder="e.g., 25" required/>
                    </div>
                    {kwhAmount && <p className="text-center font-bold text-lg">Total Cost: ₹{(parseInt(kwhAmount, 10) * PRICE_PER_KWH).toFixed(2)}</p>}
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={closeAndResetModal}>Cancel</Button>
                    <Button onClick={handleDirectCharge} disabled={!kwhAmount}>Start Direct Charge</Button>
                </DialogFooter>
            </TabsContent>
            {/* Advance Booking */}
            <TabsContent value="book">
                <div className="space-y-4 py-4">
                     <p className="text-sm text-muted-foreground">Reserve this charger for a future time slot.</p>
                    <div className="flex gap-4">
                        <div className="flex-1">
                             <Label>Date</Label>
                             <Calendar
                                mode="single"
                                selected={bookingDate}
                                onSelect={setBookingDate}
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                className="rounded-md border p-0"
                            />
                        </div>
                        <div className="flex-1">
                             <Label>Time (30-min slots)</Label>
                             <Select onValueChange={setBookingTime} value={bookingTime} required>
                                <SelectTrigger><SelectValue placeholder="Select a time" /></SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                                </SelectContent>
                             </Select>
                        </div>
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={closeAndResetModal}>Cancel</Button>
                    <Button onClick={handleBooking} disabled={!bookingDate || !bookingTime}>Book Slot</Button>
                </DialogFooter>
            </TabsContent>
          </Tabs>
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

      {/* QR Code Ticket Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setQrModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Ticket className="h-6 w-6 text-primary"/> Your Charging Ticket</DialogTitle>
                  <DialogDescription>Scan this QR code or keep it for your records.</DialogDescription>
              </DialogHeader>
              <div className="py-4 flex items-center justify-center">
                  {qrCodeData && (
                    <Image src={qrCodeData} alt="QR Code Ticket" width={256} height={256} className="rounded-lg border-4 border-primary p-2" />
                  )}
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => { setQrModalOpen(false); setQrCodeData(null); }}>Close</Button>
                  <Button onClick={() => window.print()}>Print Ticket</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

    </div>
  );
}

