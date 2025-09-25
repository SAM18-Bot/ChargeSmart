
'use client';

import { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { useAuth } from '@/hooks/use-auth';
import { useBookings } from '@/contexts/booking-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LogOut, QrCode, Zap, Clock, User, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CHARGER_POWER_KW } from '@/components/dashboard/dashboard-layout';

export default function AdminDashboardPage() {
  const { admin, adminLogout } = useAuth();
  const { bookings, activateBooking } = useBookings();
  const { toast } = useToast();
  
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<any | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const stationBookings = bookings.filter(b => b.chargerId === admin?.stationId);

  const startScanner = async () => {
    setScannerOpen(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setScannerOpen(false);
    setScannedData(null);
  };
  
  const handleScanSuccess = (result: QrScanner.ScanResult) => {
    try {
      const data = JSON.parse(result.data);
      if (data.bookingId && data.user && data.kwh) {
        setScannedData(data);
        stopScanner();
      } else {
        toast({ variant: 'destructive', title: "Invalid QR Code", description: "The scanned code is not a valid booking ticket." });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: "Invalid QR Code", description: "Could not read the QR code data." });
    }
  };

  const handleScanError = (error: any) => {
    console.error(error);
    toast({ variant: 'destructive', title: "Scanner Error", description: error.message || "Could not initialize QR scanner." });
    stopScanner();
  };

  useEffect(() => {
    if (isScannerOpen && videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        handleScanSuccess,
        {
          onDecodeError: handleScanError,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      scannerRef.current.start().catch(handleScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [isScannerOpen]);


  const confirmChargeStart = () => {
    if (!scannedData) return;

    const chargeTimeMinutes = Math.round((scannedData.kwh / CHARGER_POWER_KW) * 60);

    const activated = activateBooking(scannedData.bookingId, scannedData.chargerId, chargeTimeMinutes);

    if (activated) {
      toast({ title: "Charge Started!", description: `Session for ${scannedData.user} has begun.` });
    } else {
      toast({ variant: 'destructive', title: "Activation Failed", description: "Booking not found or already active." });
    }
    setScannedData(null);
  };
  
  if (!admin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Managing Station: {admin.stationId}</p>
        </div>
        <div className='flex items-center gap-4'>
            <Button onClick={startScanner} className="bg-accent text-accent-foreground hover:bg-accent/80">
                <QrCode className="mr-2 h-4 w-4" />
                Scan Ticket
            </Button>
            <Button variant="outline" onClick={adminLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
      </header>

      <main>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'><Bell /> Upcoming & Active Bookings</CardTitle>
            <CardDescription>Users who have paid and are expected at your station.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Booking Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Energy (kWh)</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stationBookings.length > 0 ? stationBookings.map(booking => (
                  <TableRow key={booking.id}>
                    <TableCell className='font-medium'>{booking.userName}</TableCell>
                    <TableCell>{format(new Date(booking.date), 'MMM d, h:mm a')}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'pending' ? 'secondary' : 'default'} className={booking.status === 'active' ? 'bg-green-500' : ''}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{booking.kwh.toFixed(2)}</TableCell>
                    <TableCell>₹{booking.cost.toFixed(2)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No bookings found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      
      <Dialog open={isScannerOpen} onOpenChange={stopScanner}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Scan User Ticket</DialogTitle>
                <DialogDescription>Point the camera at the QR code on the user's device.</DialogDescription>
            </DialogHeader>
            <div className='bg-muted rounded-md overflow-hidden aspect-video'>
                <video ref={videoRef} className='w-full h-full object-cover' />
            </div>
            <DialogFooter>
                <Button variant='outline' onClick={stopScanner}>Cancel</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!scannedData} onOpenChange={() => setScannedData(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Charge Session</DialogTitle>
                <DialogDescription>Verify the details below and start the charging session.</DialogDescription>
            </DialogHeader>
            {scannedData && (
                <div className='space-y-4 py-4'>
                    <div className='flex items-center gap-3 p-3 bg-muted rounded-md'>
                        <User className='w-5 h-5 text-primary' />
                        <div>
                            <p className='text-xs text-muted-foreground'>User</p>
                            <p className='font-bold'>{scannedData.user}</p>
                        </div>
                    </div>
                     <div className='flex items-center gap-3 p-3 bg-muted rounded-md'>
                        <Zap className='w-5 h-5 text-primary' />
                        <div>
                            <p className='text-xs text-muted-foreground'>Energy</p>
                            <p className='font-bold'>{scannedData.kwh} kWh</p>
                        </div>
                    </div>
                     <div className='flex items-center gap-3 p-3 bg-muted rounded-md'>
                        <Clock className='w-5 h-5 text-primary' />
                        <div>
                            <p className='text-xs text-muted-foreground'>Estimated Time</p>
                            <p className='font-bold'>~{Math.round((scannedData.kwh / CHARGER_POWER_KW) * 60)} minutes</p>
                        </div>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant='outline' onClick={() => setScannedData(null)}>Cancel</Button>
                <Button className='bg-accent text-accent-foreground' onClick={confirmChargeStart}>Start Charging</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
