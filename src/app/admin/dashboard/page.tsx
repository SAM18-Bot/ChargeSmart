
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { LogOut, QrCode, Zap, Clock, User, Bell, AlertTriangle, Camera, CheckCircle, XCircle, RefreshCw, Settings, Mail, Ticket, IndianRupee } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useBookings } from '@/contexts/booking-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import QrScanner from 'qr-scanner';
import { CHARGER_POWER_KW } from '@/components/dashboard/dashboard-layout';
import { format } from 'date-fns';
import type { Booking } from '@/lib/types';


export default function AdminDashboardPage() {
  const { admin, adminLogout } = useAuth();
  const { bookings, activateBooking } = useBookings();
  const { toast } = useToast();
  const router = useRouter();

  const [isScannerOpen, setScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [stationBookings, setStationBookings] = useState<Booking[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (admin) {
      const filtered = bookings.filter(b => b.chargerId === admin.stationId);
      setStationBookings(filtered);
    }
  }, [bookings, admin]);


  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  const handleScanSuccess = (result: QrScanner.ScanResult) => {
    try {
      const data = JSON.parse(result.data);
      // More robust check for all expected fields
      if (data.bookingId && data.user && data.kwh && data.chargerId && data.email && data.amount && data.date) {
        setScannedData(data);
        stopScanner();
        toast({
          title: "QR Code Scanned!",
          description: "Ticket details loaded successfully."
        });
      } else {
        toast({
          variant: 'destructive',
          title: "Invalid QR Code",
          description: "The scanned code is not a valid booking ticket. It's missing some information."
        });
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: "Invalid QR Code",
        description: "Could not read the QR code data."
      });
    }
  };

  const handleScanError = (error: any) => {
    const errorString = String(error).toLowerCase();
    if (!errorString.includes('no qr code found')) {
      addDebugInfo(`Scanner error: ${error.message || error}`);
    }
  };


  const startCamera = async () => {
    if (!videoRef.current) return;
    
    setIsInitializing(true);
    setCameraError(null);
    setHasCameraPermission(null);
    setRetryCount(currentRetry => currentRetry + 1);
    addDebugInfo('Attempting to start camera...');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment'
            } 
        });

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setHasCameraPermission(true);
        addDebugInfo('Camera stream active.');

        scannerRef.current = new QrScanner(
            videoRef.current,
            handleScanSuccess,
            {
                onDecodeError: handleScanError,
                highlightScanRegion: true,
                highlightCodeOutline: true,
                maxScansPerSecond: 10, // Increased scan frequency
                calculateScanRegion: (video) => {
                    const videoWidth = video.videoWidth;
                    const videoHeight = video.videoHeight;
                    const regionSize = Math.min(videoWidth, videoHeight) * 0.75;
                    return {
                        x: (videoWidth - regionSize) / 2,
                        y: (videoHeight - regionSize) / 2,
                        width: regionSize,
                        height: regionSize,
                    };
                }
            }
        );
        await scannerRef.current.start();
        addDebugInfo('QR scanner started.');

    } catch (error: any) {
        addDebugInfo(`Camera error: ${error.name} - ${error.message}`);
        setHasCameraPermission(false);
        let errorMessage = 'An unexpected error occurred.';
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera permission was denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No camera was found on this device.';
        }
        setCameraError(errorMessage);
    } finally {
        setIsInitializing(false);
    }
  };

  const stopScanner = () => {
    scannerRef.current?.stop();
    scannerRef.current?.destroy();
    scannerRef.current = null;
    
    if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        addDebugInfo('Camera stream stopped.');
    }
    setScannerOpen(false);
  };
  
  const handleOpenScanner = () => {
    setScannerOpen(true);
    setDebugInfo([]);
    setRetryCount(0);
  };

  useEffect(() => {
    if (isScannerOpen) {
      // Small delay to allow the dialog to render before starting camera
      const timer = setTimeout(() => {
          startCamera();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isScannerOpen]);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      stopScanner();
    }
    setScannerOpen(open);
  }

  const simulateQRScan = () => {
    if (stationBookings.length === 0) {
      toast({ variant: "destructive", title: "No Bookings", description: "There are no pending bookings to simulate a scan for." });
      return;
    }
    const bookingToSimulate = stationBookings[0];
    const mockQRData = {
        bookingId: bookingToSimulate.id,
        chargerId: bookingToSimulate.chargerId,
        user: bookingToSimulate.userName,
        email: 'user@example.com', // mock email
        kwh: bookingToSimulate.kwh,
        amount: bookingToSimulate.cost.toFixed(2),
        date: format(new Date(bookingToSimulate.date), "PPpp"),
        description: `Simulated charge: ${bookingToSimulate.kwh} kWh`
    };
    setScannedData(mockQRData);
    stopScanner();
  };

  const confirmChargeStart = () => {
    if (!scannedData) return;
    const chargeTimeMinutes = Math.round((scannedData.kwh / CHARGER_POWER_KW) * 60);

    const activated = activateBooking(scannedData.bookingId, scannedData.chargerId, chargeTimeMinutes);

    if (activated) {
        toast({ title: "Charge Started!", description: `Session for ${scannedData.user} has begun.` });
    } else {
        toast({ variant: 'destructive', title: "Activation Failed", description: "Booking not found, already active, or charger is occupied." });
    }
    setScannedData(null);
  };

  if (!admin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading admin data or redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Managing Station: {admin.stationName || admin.stationId}</p>
        </div>
        <div className='flex items-center gap-4'>
          <Button onClick={handleOpenScanner} className="bg-primary hover:bg-primary/90">
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
            <CardTitle className='flex items-center gap-2'>
              <Bell /> Upcoming & Active Bookings
            </CardTitle>
            <CardDescription>Users who have paid and are expected at your station.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Booking Time</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Energy (kWh)</th>
                    <th className="text-left p-3 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {stationBookings.length > 0 ? stationBookings.map(booking => (
                    <tr key={booking.id} className="border-b hover:bg-muted">
                      <td className='p-3 font-medium'>{booking.userName}</td>
                      <td className='p-3'>{format(new Date(booking.date), 'MMM d, h:mm a')}</td>
                      <td className='p-3'>
                        <Badge variant={booking.status === 'pending' ? 'secondary' : 'default'} 
                               className={booking.status === 'active' ? 'bg-green-500 text-white' : ''}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className='p-3'>{booking.kwh.toFixed(2)}</td>
                      <td className='p-3'>₹{booking.cost.toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center h-24 text-muted-foreground">
                        No bookings found for this station yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* QR Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scan User Ticket</DialogTitle>
            <DialogDescription>
              Point the camera at the QR code on the user's device.
            </DialogDescription>
          </DialogHeader>
          
          <div className='bg-muted rounded-lg overflow-hidden aspect-square relative flex items-center justify-center border-2 border-dashed border-border'>
             <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline
            />
            
            {hasCameraPermission && !isInitializing && (
              <div className="absolute inset-8 border-2 border-primary rounded-lg pointer-events-none animate-pulse">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary/70 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary/70 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary/70 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary/70 rounded-br-lg"></div>
              </div>
            )}

            {isInitializing && (
              <div className='absolute inset-0 flex items-center justify-center bg-background/95'>
                <div className='text-center p-4'>
                  <Camera className="h-12 w-12 mx-auto mb-3 animate-bounce text-primary" />
                  <p className='text-lg font-medium text-muted-foreground mb-2'>Starting Camera...</p>
                  <p className='text-sm text-muted-foreground mb-3'>Attempt {retryCount}</p>
                </div>
              </div>
            )}

            {hasCameraPermission === false && (
              <div className='absolute inset-0 flex items-center justify-center p-4 bg-background/95'>
                <div className="w-full max-w-sm">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Issue</AlertTitle>
                    <AlertDescription className="mb-3 text-xs">
                      {cameraError}
                    </AlertDescription>
                     <Button 
                      size="sm" 
                      onClick={startCamera}
                      className="w-full"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Try Again
                    </Button>
                  </Alert>
                </div>
              </div>
            )}
          </div>
          
          {debugInfo.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="text-xs font-medium mb-2">Debug Info:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                {debugInfo.map((info, i) => (
                  <div key={i} className="font-mono">{info}</div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant='outline' onClick={() => handleDialogClose(false)}>
              Close Scanner
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={simulateQRScan}
            >
              Simulate Scan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={!!scannedData} onOpenChange={() => setScannedData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Charge Session</DialogTitle>
            <DialogDescription>
              Verify the details below and start the charging session.
            </DialogDescription>
          </DialogHeader>
          
          {scannedData && (
            <div className='space-y-4 py-4'>
              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className='flex items-center gap-3 p-3 bg-muted rounded-md col-span-2'>
                    <User className='w-5 h-5 text-primary' />
                    <div>
                      <p className='text-xs text-muted-foreground'>User</p>
                      <p className='font-bold'>{scannedData.user}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-muted rounded-md col-span-2'>
                    <Mail className='w-5 h-5 text-primary' />
                    <div>
                      <p className='text-xs text-muted-foreground'>Email</p>
                      <p className='font-bold'>{scannedData.email}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-muted rounded-md'>
                    <Zap className='w-5 h-5 text-yellow-500' />
                    <div>
                      <p className='text-xs text-muted-foreground'>Energy</p>
                      <p className='font-bold'>{scannedData.kwh} kWh</p>
                    </div>
                  </div>
                   <div className='flex items-center gap-3 p-3 bg-muted rounded-md'>
                    <IndianRupee className='w-5 h-5 text-green-500' />
                    <div>
                      <p className='text-xs text-muted-foreground'>Cost Paid</p>
                      <p className='font-bold'>₹{scannedData.amount}</p>
                    </div>
                  </div>
                   <div className='flex items-center gap-3 p-3 bg-muted rounded-md'>
                    <Ticket className='w-5 h-5 text-blue-500' />
                    <div>
                      <p className='text-xs text-muted-foreground'>Booking ID</p>
                      <p className='font-mono text-xs'>{scannedData.bookingId}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-3 bg-muted rounded-md'>
                    <Clock className='w-5 h-5 text-purple-500' />
                    <div>
                      <p className='text-xs text-muted-foreground'>Est. Time</p>
                      <p className='font-bold'>
                        ~{Math.round((scannedData.kwh / CHARGER_POWER_KW) * 60)} minutes
                      </p>
                    </div>
                  </div>
              </div>
              <div className="pt-2">
                 <p className="text-xs text-muted-foreground text-center">{scannedData.description}</p>
                 <p className="text-xs text-muted-foreground text-center">at {scannedData.chargerId}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant='outline' onClick={() => setScannedData(null)}>
              Cancel
            </Button>
            <Button 
              className='bg-primary text-primary-foreground hover:bg-primary/90' 
              onClick={confirmChargeStart}
            >
              Start Charging
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    