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
import Chatbot, { ChatbotAction } from '../chatbot/chatbot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { add, format, set } from 'date-fns';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Loader2, Navigation, Ticket } from 'lucide-react';
import { ChargingOptionsCard } from './charging-options-card';
import { Slider } from '../ui/slider';
import { motion } from 'framer-motion';

declare global {
    interface Window {
        Razorpay: any;
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const PRICE_PER_KWH = 18; // Rupees per kWh
const CHARGER_POWER_KW = 22; // kW

export interface PendingCharge {
    charger: Charger;
    type: 'smart' | 'direct';
    kwh: number;
    cost: number;
    evModel?: string;
    batteryPercentage?: number;
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function DashboardLayout({ user }: { user: User }) {
  const [chargers, setChargers] = useState<Charger[]>(initialChargers);
  const [nearestChargers, setNearestChargers] = useState<Charger[]>([]);
  const [evs] = useState<EV[]>(initialEvs);
  const [isChargeModalOpen, setChargeModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  
  const [pendingCharge, setPendingCharge] = useState<PendingCharge | null>(null);
  
  const [selectedEvModel, setSelectedEvModel] = useState('');
  const [batteryPercentage, setBatteryPercentage] = useState('');
  const [kwhAmount, setKwhAmount] = useState('10');
  const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
  const [bookingTime, setBookingTime] = useState<string>('');
  const [activeTab, setActiveTab] = useState('smart');

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false); // Failed to get location
          toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Showing default results.'})
        }
      );
    } else {
        setIsLocating(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (userLocation) {
      const sortedChargers = [...chargers]
        .map(charger => ({
          ...charger,
          distance: haversineDistance(userLocation.lat, userLocation.lng, charger.lat, charger.lng)
        }))
        .sort((a, b) => a.distance - b.distance);
      setNearestChargers(sortedChargers.slice(0, 4));
    } else {
       setNearestChargers(chargers.slice(0,4));
    }
  }, [userLocation, chargers]);

  const handleOpenChargeModal = (chargerId: string) => {
    const charger = chargers.find(c => c.id === chargerId);
    if(charger) {
        setSelectedCharger(charger);
        setChargeModalOpen(true);
    }
  };

  const handleOpenOptionsModal = (option: 'smart' | 'direct' | 'book') => {
      setActiveTab(option);
      setChargeModalOpen(true);
  }
  
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

  const initiatePayment = (chargeDetails: PendingCharge) => {
    setPendingCharge(chargeDetails);
    setPaymentModalOpen(true);
    closeAndResetModal();
  };

  const handleSmartChargeRequest = () => {
    if (!selectedCharger || !selectedEvModel || !batteryPercentage) return;
    
    const selectedEVObject = evs.find(ev => ev.model === selectedEvModel);
    if (!selectedEVObject) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected EV model not found.'});
      return;
    }

    const currentBattery = parseInt(batteryPercentage, 10);
    const kwhNeeded = parseFloat((((100 - currentBattery) / 100) * selectedEVObject.batteryCapacity).toFixed(2));
    const cost = parseFloat((kwhNeeded * PRICE_PER_KWH).toFixed(2));

    initiatePayment({
        charger: selectedCharger,
        type: 'smart',
        kwh: kwhNeeded,
        cost,
        evModel: selectedEvModel,
        batteryPercentage: currentBattery
    });
  };

  const handleDirectChargeRequest = () => {
    if (!selectedCharger || !kwhAmount) return;
    
    const kwh = parseFloat(kwhAmount);
    if (isNaN(kwh) || kwh <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid kWh amount.'});
      return;
    }

    const cost = parseFloat((kwh * PRICE_PER_KWH).toFixed(2));
    
    initiatePayment({
        charger: selectedCharger,
        type: 'direct',
        kwh,
        cost
    });
  }

  const handleBooking = () => {
    if (!selectedCharger || !bookingDate || !bookingTime) return;

    const [hours, minutes] = bookingTime.split(':').map(Number);
    const bookingStart = set(bookingDate, { hours, minutes });
    
    toast({
        title: "Slot Booked!",
        description: `You have booked ${selectedCharger.name} for ${format(bookingStart, "MMM d, yyyy 'at' h:mm a")}.`,
    });
    
    closeAndResetModal();
  }

  const closeAndResetModal = () => {
    setChargeModalOpen(false);
    setSelectedCharger(null);
    setSelectedEvModel('');
    setBatteryPercentage('');
    setKwhAmount('10');
    setBookingDate(new Date());
    setBookingTime('');
  }
  
  const handlePayment = async () => {
    if (!pendingCharge) return;

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: pendingCharge.cost * 100 }),
      });
      
      if (!response.ok) throw new Error('Failed to create Razorpay order');
      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ChargeSmart',
        description: `Payment for charging at ${pendingCharge.charger.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          setPaymentModalOpen(false);
          toast({
            title: "Payment Successful!",
            description: `Your transaction is complete. Starting your charge now.`,
          });
          
          startChargingSession(pendingCharge);
          generateQrTicket(pendingCharge, response.razorpay_payment_id);
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#5B21B6' },
        modal: {
          ondismiss: () => {
            toast({
                variant: 'destructive',
                title: 'Payment Cancelled',
                description: 'Your payment was not completed.',
            });
            setPendingCharge(null);
          }
        }
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

  const startChargingSession = (chargeDetails: PendingCharge) => {
      const chargeTimeMinutes = Math.round((chargeDetails.kwh / CHARGER_POWER_KW) * 60);
      const chargeEndTime = add(new Date(), { minutes: chargeTimeMinutes });

      setChargers(prevChargers => prevChargers.map(c => {
        if (c.id === chargeDetails.charger.id) {
          return {
            ...c,
            status: 'Occupied',
            currentUser: user,
            currentVehicle: chargeDetails.type === 'smart' 
                ? { model: chargeDetails.evModel!, batteryPercentage: chargeDetails.batteryPercentage! }
                : { model: 'Direct kWh Charge' },
            kwhReserved: chargeDetails.kwh,
            startTime: new Date(),
            estimatedEndTime: chargeEndTime,
          };
        }
        return c;
      }));
  }

  const generateQrTicket = async (chargeDetails: PendingCharge, transactionId: string) => {
    const ticketData = {
      charger: chargeDetails.charger.name,
      user: user.name,
      email: user.email,
      kwh: chargeDetails.kwh,
      amount: chargeDetails.cost.toFixed(2),
      date: format(new Date(), "PPpp"),
      transactionId,
    };

    try {
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData), {
        errorCorrectionLevel: 'H',
        type: 'image/jpeg',
        quality: 0.9,
        margin: 1,
        color: { dark:"#29003D", light:"#FFFFFF" }
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
    setPendingCharge(null);
  }

  const handleAssistantAction = (action: ChatbotAction) => {
    switch (action.type) {
        case 'INITIATE_PAYMENT':
            if (action.payload) {
                initiatePayment(action.payload as PendingCharge);
            }
            break;
        case 'BOOK_SLOT_CONFIRMED':
            if (action.payload) {
                const { charger, date, time } = action.payload;
                const [hours, minutes] = time.split(':').map(Number);
                const bookingStart = set(new Date(date), { hours, minutes });
                toast({
                    title: "Voice Booking Confirmed!",
                    description: `You have booked ${charger.name} for ${format(bookingStart, "MMM d, yyyy 'at' h:mm a")}.`,
                });
            }
            break;
        case 'REQUIRE_MORE_INFO':
            // The chatbot UI handles showing the message, no extra action needed here.
            break;
    }
  };
  
  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const totalMinutes = i * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  });

  const kwhValue = parseFloat(kwhAmount);
  const calculatedCost = !isNaN(kwhValue) ? (kwhValue * PRICE_PER_KWH).toFixed(2) : '0.00';

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header user={user} assistantDialog={<AiAssistantDialog evs={evs} chargers={chargers} />} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-12">

        {/* Section 1: Charging Options */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
            <h1 className="text-3xl font-bold font-headline mb-6 text-foreground">Start Your Session</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ChargingOptionsCard 
                    title="Smart Charge"
                    description="Optimize charging based on your EV's needs. We'll calculate the kWh to full."
                    onClick={() => handleOpenOptionsModal('smart')}
                />
                <ChargingOptionsCard 
                    title="Direct kWh"
                    description="Choose a specific amount of kWh to add. Quick and simple."
                    onClick={() => handleOpenOptionsModal('direct')}
                />
                <ChargingOptionsCard 
                    title="Book a Slot"
                    description="Reserve a charger for a future time. Plan ahead and avoid waiting."
                    onClick={() => handleOpenOptionsModal('book')}
                />
            </div>
        </motion.section>

        {/* Section 2: Nearest Stations */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
            <h2 className="text-3xl font-bold font-headline mb-6 flex items-center gap-3 text-foreground">
                <Navigation className="w-8 h-8 text-primary" />
                Nearest Stations
            </h2>
            {isLocating ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Finding stations near you...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {nearestChargers.map(charger => (
                    <ChargerCard
                    key={charger.id}
                    charger={charger}
                    onCharge={handleOpenChargeModal}
                    onJoinQueue={handleJoinQueue}
                    currentUser={user}
                    />
                ))}
                </div>
            )}
        </motion.section>
        
        {/* Section 3: Map View */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
            <h2 className="text-3xl font-bold font-headline mb-6 text-foreground">Station Map</h2>
            <MapView chargers={chargers} />
        </motion.section>

      </main>
      
      <Chatbot onAction={handleAssistantAction} />
      
      {/* Charging Options Modal */}
      <Dialog open={isChargeModalOpen} onOpenChange={closeAndResetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Charge Session Setup</DialogTitle>
            <DialogDescription>
                {selectedCharger 
                    ? `Configuring your session for ${selectedCharger.name}.`
                    : "First, select a nearby charger."
                }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Charger selection is needed if no charger was pre-selected */}
            {!selectedCharger && (
                <div className="space-y-2">
                    <Label>Select a Charger</Label>
                    <Select onValueChange={(chargerId) => setSelectedCharger(chargers.find(c => c.id === chargerId) || null)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a station..." />
                        </SelectTrigger>
                        <SelectContent>
                            {nearestChargers.filter(c => c.status === 'Available').map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name} ({c.distance?.toFixed(1)} km away)</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="smart">Smart</TabsTrigger>
                    <TabsTrigger value="direct">Direct</TabsTrigger>
                    <TabsTrigger value="book">Book</TabsTrigger>
                </TabsList>
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
                        <Button onClick={handleSmartChargeRequest} disabled={!selectedCharger || !selectedEvModel || !batteryPercentage}>Proceed to Payment</Button>
                    </DialogFooter>
                </TabsContent>
                <TabsContent value="direct">
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">Specify the exact amount of electricity you need (₹{PRICE_PER_KWH}/kWh).</p>
                        
                        <div className='flex items-center gap-4'>
                             <Input 
                                type="number" 
                                min="0.5" 
                                max="100" 
                                step="0.1" 
                                value={kwhAmount} 
                                onChange={e => setKwhAmount(e.target.value)} 
                                required
                                className="w-24 text-center text-lg font-bold"
                            />
                            <Slider
                                value={[isNaN(kwhValue) ? 0 : kwhValue]}
                                onValueChange={(value) => setKwhAmount(String(value[0]))}
                                max={50}
                                min={0.5}
                                step={0.5}
                            />
                        </div>
                        <div className="flex justify-center gap-2">
                            {[10, 20, 30].map(val => (
                                <Button key={val} variant="outline" size="sm" onClick={() => setKwhAmount(String(val))}>
                                    {val} kWh
                                </Button>
                            ))}
                        </div>

                        {kwhAmount && selectedCharger && !isNaN(kwhValue) && (
                            <p className="text-center font-bold text-lg text-primary">Total Cost: ₹{calculatedCost}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeAndResetModal}>Cancel</Button>
                        <Button onClick={handleDirectChargeRequest} disabled={!selectedCharger || !kwhAmount || isNaN(kwhValue)}>Proceed to Payment</Button>
                    </DialogFooter>
                </TabsContent>
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
                        <Button onClick={handleBooking} disabled={!selectedCharger || !bookingDate || !bookingTime}>Book Slot</Button>
                    </DialogFooter>
                </TabsContent>
              </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(isOpen) => { if (!isOpen) setPendingCharge(null); setPaymentModalOpen(isOpen); }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Payment Required</DialogTitle>
                <DialogDescription>Please complete the payment to start your charging session at {pendingCharge?.charger.name}.</DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center">
                <p className="text-muted-foreground">Total Amount</p>
                <p className="text-5xl font-bold font-headline text-primary">₹{pendingCharge?.cost.toFixed(2)}</p>
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
                  <DialogDescription>Show this QR code at the station to validate your session. A copy has been sent to your email.</DialogDescription>
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
