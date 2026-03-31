'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanStats, setScanStats] = useState({ scansPerSec: 0, regionSize: '85%' });
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const scanCountRef = useRef<number>(0);
  const scanStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (admin) {
      const filtered = bookings.filter(b => b.chargerId === admin.stationId);
      setStationBookings(filtered);
    }
  }, [bookings, admin]);

  const addDebugInfo = useCallback((message: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const stopScanner = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    scannerRef.current?.stop();
    scannerRef.current?.destroy();
    scannerRef.current = null;
    
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      addDebugInfo('Camera stopped');
    }
    
    setScannerOpen(false);
    setIsScanning(false);
    setScanSuccess(false);
    lastScanTimeRef.current = 0;
    scanStartTimeRef.current = 0;
    scanCountRef.current = 0;
  }, [addDebugInfo]);

  // Update scan statistics
  const updateScanStats = useCallback(() => {
    const now = Date.now();
    if (scanStartTimeRef.current === 0) {
      scanStartTimeRef.current = now;
      scanCountRef.current = 0;
    }
    
    scanCountRef.current++;
    const timeElapsed = (now - scanStartTimeRef.current) / 1000;
    const scansPerSec = timeElapsed > 0 ? Math.round(scanCountRef.current / timeElapsed) : 0;
    
    setScanStats(prev => ({ ...prev, scansPerSec }));
  }, []);

  // Enhanced scan success handler with duplicate prevention
  const handleScanSuccess = useCallback((result: QrScanner.ScanResult) => {
    // Prevent duplicate scans
    if (scanSuccess) {
      return;
    }

    const now = Date.now();
    
    // Debounce rapid scans (prevent duplicate processing)
    if (now - lastScanTimeRef.current < 500) {
      return;
    }
    lastScanTimeRef.current = now;

    // Set success flag immediately to prevent duplicates
    setScanSuccess(true);
    setIsScanning(true);
    addDebugInfo(`QR detected: ${result.data.substring(0, 50)}...`);

    try {
      const data = JSON.parse(result.data);
      
      // More robust validation with early returns
      const requiredFields = ['bookingId', 'user', 'kwh', 'chargerId', 'email', 'amount', 'date'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }

      // Validate data types
      if (typeof data.kwh !== 'number' || typeof data.amount !== 'number') {
        if (isNaN(parseFloat(data.kwh)) || isNaN(parseFloat(data.amount))) {
          throw new Error('Invalid numeric data');
        }
        // Convert string numbers to actual numbers
        data.kwh = parseFloat(data.kwh);
        data.amount = parseFloat(data.amount);
      }

      setScannedData(data);
      
      // Stop scanner immediately after successful detection
      stopScanner();
      
      // Success feedback with haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      
      toast({
        title: "✅ QR Code Scanned!",
        description: `Ticket for ${data.user} loaded in ${((Date.now() - scanStartTimeRef.current) / 1000).toFixed(1)}s`
      });
      
      addDebugInfo('Valid QR code processed successfully');
      
    } catch (e: any) {
      setScanSuccess(false); // Reset on error
      addDebugInfo(`QR parsing failed: ${e.message}`);
      
      // Error feedback
      if (navigator.vibrate) {
        navigator.vibrate([200]);
      }
      
      toast({
        variant: 'destructive',
        title: "❌ Invalid QR Code",
        description: e.message.includes('JSON') 
          ? "Could not read the QR code data." 
          : e.message
      });
    } finally {
      setIsScanning(false);
    }
  }, [addDebugInfo, toast, scanSuccess, stopScanner]);

  // Optimized error handler - reduce noise
  const handleScanError = useCallback((error: any) => {
    updateScanStats(); // Count scan attempts
    
    const errorString = String(error).toLowerCase();
    
    // Filter out common non-critical errors that add noise
    const ignoredErrors = [
      'no qr code found',
      'no code found', 
      'scanner error',
      'cannot read',
      'decode failed',
      'not found'
    ];
    
    const shouldLog = !ignoredErrors.some(ignored => errorString.includes(ignored));
    
    if (shouldLog) {
      addDebugInfo(`Scanner error: ${error.message || error}`);
    }
  }, [addDebugInfo, updateScanStats]);

    // Fallback camera start with basic constraints
  const startCameraFallback = async () => {
    if (!videoRef.current) return;
    
    addDebugInfo('Trying fallback camera settings...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });

      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setHasCameraPermission(true);
      
      scannerRef.current = new (QrScanner as any)(
        videoRef.current,
        (result: any) => handleScanSuccess(result),
        ({
          onDecodeError: handleScanError,
          highlightScanRegion: true,
          maxScansPerSecond: 20
        } as any)
      );
      
      await scannerRef.current?.start();
      addDebugInfo('Fallback camera started');
      
    } catch (fallbackError: any) {
      addDebugInfo(`Fallback failed: ${fallbackError.message}`);
    }
  };

  const startCamera = async () => {
    if (!videoRef.current) return;
    
    setIsInitializing(true);
    setCameraError(null);
    setHasCameraPermission(null);
    setRetryCount(currentRetry => currentRetry + 1);
    addDebugInfo('Starting optimized camera...');

    try {
      // Request high-resolution camera with optimal settings for QR scanning
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 15 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.autoplay = true;
      
      // Wait for video metadata to be loaded
      await new Promise((resolve) => {
        videoRef.current!.onloadedmetadata = resolve;
      });
      
      await videoRef.current.play();

      setHasCameraPermission(true);
      const settings = stream.getVideoTracks()[0].getSettings();
      addDebugInfo(`Camera active: ${settings.width}x${settings.height} @ ${settings.frameRate}fps`);

      // Create optimized QR scanner with maximum performance settings
      scannerRef.current = new (QrScanner as any)(
        videoRef.current,
        (result: any) => handleScanSuccess(result),
        ({
          onDecodeError: handleScanError,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          // MAXIMUM scan frequency for fastest detection
          maxScansPerSecond: 25, // Increased from 10 to 25
          // Larger scan region - 85% instead of 75% for better detection
          calculateScanRegion: (video: any) => {
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const size = Math.min(videoWidth, videoHeight);
            const regionSize = size * 0.85; // Increased from 0.6 to 0.85
            return {
              x: (videoWidth - regionSize) / 2,
              y: (videoHeight - regionSize) / 2,
              width: regionSize,
              height: regionSize,
              downScaledWidth: 640, // Add downscaled processing for speed
              downScaledHeight: 640,
            };
          },
          // Additional performance optimizations
          preferredCamera: 'environment',
          // Enable worker for better performance (if available)
          worker: typeof window !== 'undefined' ? '/qr-scanner-worker.min.js' : undefined
        } as any)
      );

      await scannerRef.current?.start();
      
      // Reset scan statistics
      setScanSuccess(false);
      scanStartTimeRef.current = Date.now();
      scanCountRef.current = 0;
      setScanStats({ scansPerSec: 0, regionSize: '85%' });
      
      addDebugInfo('QR scanner started with maximum performance settings');

      // Set focus to continuous for better QR detection
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
        await track.applyConstraints({});
        addDebugInfo('Continuous focus enabled');
      }

    } catch (error: any) {
      addDebugInfo(`Camera error: ${error.name} - ${error.message}`);
      setHasCameraPermission(false);
      
      let errorMessage = 'An unexpected error occurred.';
      
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
          break;
        case 'NotFoundError':
          errorMessage = 'No camera found on this device.';
          break;
        case 'NotReadableError':
          errorMessage = 'Camera is being used by another application.';
          break;
        case 'OverconstrainedError':
          errorMessage = 'Camera constraints not supported. Trying fallback...';
          // Try with simpler constraints
          setTimeout(() => startCameraFallback(), 1000);
          break;
        default:
          errorMessage = `Camera error: ${error.message}`;
      }
      
      setCameraError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };
  
  const handleOpenScanner = () => {
    setScannerOpen(true);
    setDebugInfo([]);
    setRetryCount(0);
    setIsScanning(false);
    setScanSuccess(false);
    setShowDebugInfo(false);
  };

  // Optimized useEffect with cleanup
  useEffect(() => {
    if (isScannerOpen) {
      const timer = setTimeout(startCamera, 100);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isScannerOpen, stopScanner]);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      stopScanner();
    }
    setScannerOpen(open);
  };

  const simulateQRScan = () => {
    if (stationBookings.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "No Bookings", 
        description: "No pending bookings to simulate." 
      });
      return;
    }
    
    const bookingToSimulate = stationBookings[0];
    const mockQRData = {
      bookingId: bookingToSimulate.id,
      chargerId: bookingToSimulate.chargerId,
      user: bookingToSimulate.userName,
      email: 'user@example.com',
      kwh: bookingToSimulate.kwh,
      amount: parseFloat(bookingToSimulate.cost.toFixed(2)),
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
      toast({ 
        title: "🔋 Charge Started!", 
        description: `Session for ${scannedData.user} has begun.` 
      });
    } else {
      toast({ 
        variant: 'destructive', 
        title: "❌ Activation Failed", 
        description: "Booking not found, already active, or charger occupied." 
      });
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
          <Button 
            onClick={handleOpenScanner} 
            className="bg-primary hover:bg-primary/90"
            disabled={isScannerOpen}
          >
            <QrCode className="mr-2 h-4 w-4" />
            {isScannerOpen ? 'Scanner Active...' : 'Scan Ticket'}
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
      
      {/* Optimized QR Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              High-Speed QR Scanner
              {isScanning && <span className="text-green-500 text-sm animate-pulse">● Scanning...</span>}
            </DialogTitle>
            <DialogDescription>
              Point camera at QR code. Optimized for fast detection.
            </DialogDescription>
          </DialogHeader>
          
          <div className='bg-muted rounded-lg overflow-hidden aspect-square relative flex items-center justify-center border-2 border-dashed border-border'>
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            
            {hasCameraPermission && !isInitializing && (
              <>
                {/* Enhanced animated scan overlay with larger region */}
                <div className="absolute inset-6 border-2 border-primary rounded-lg pointer-events-none"> {/* Changed from inset-8 to inset-6 for larger scan area */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary/70 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary/70 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary/70 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary/70 rounded-br-lg"></div>
                  
                  {/* Scanning instruction overlay */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    Point at QR Code
                  </div>
                </div>
                
                {/* Performance stats overlay */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span>{scanStats.scansPerSec}/sec</span>
                  </div>
                  <div className="text-xs opacity-80">Region: {scanStats.regionSize}</div>
                </div>
                
                {/* Scanning indicator */}
                {isScanning && (
                  <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    Processing QR...
                  </div>
                )}
                
                {/* Enhanced scan line animation */}
                <div className="absolute inset-6 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse opacity-70" 
                       style={{
                         animation: 'scanLine 2s linear infinite',
                         transformOrigin: 'center'
                       }} />
                </div>
              </>
            )}

            {isInitializing && (
              <div className='absolute inset-0 flex items-center justify-center bg-background/95'>
                <div className='text-center p-4'>
                  <Camera className="h-12 w-12 mx-auto mb-3 animate-bounce text-primary" />
                  <p className='text-lg font-medium text-muted-foreground mb-2'>Starting Camera...</p>
                  <p className='text-sm text-muted-foreground mb-3'>Attempt {retryCount}</p>
                  <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse"></div>
                  </div>
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
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="mb-2 w-full"
              >
                <Settings className="w-3 h-3 mr-1" />
                {showDebugInfo ? 'Hide' : 'Show'} Performance Info ({debugInfo.length})
              </Button>
              
              {showDebugInfo && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {debugInfo.map((info, i) => (
                      <div key={i} className="font-mono text-xs">{info}</div>
                    ))}
                  </div>
                </div>
              )}
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
              Test Scan
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
              Verify the details from the scanned ticket before starting the session.
            </DialogDescription>
          </DialogHeader>
          
          {scannedData && (
            <div className='space-y-4 py-4'>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className='flex items-start justify-between'>
                    <div>
                      <p className='text-xs text-muted-foreground'>User</p>
                      <p className='font-bold text-lg'>{scannedData.user}</p>
                      <p className='text-xs text-muted-foreground'>{scannedData.email}</p>
                    </div>
                    <User className='w-8 h-8 text-primary' />
                  </div>
                  <div className="border-t border-dashed my-2"></div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className='text-xs text-muted-foreground'>Booking ID</p>
                      <p className='font-mono text-xs'>{scannedData.bookingId}</p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Charger ID</p>
                      <p className='font-mono text-xs'>{scannedData.chargerId}</p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Energy</p>
                      <p className='font-bold'>{scannedData.kwh} kWh</p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Amount Paid</p>
                      <p className='font-bold'>₹{scannedData.amount}</p>
                    </div>
                  </div>
                   <div className="border-t border-dashed my-2"></div>
                   <div>
                      <p className='text-xs text-muted-foreground'>Est. Time</p>
                      <p className='font-bold'>~{Math.round((scannedData.kwh / CHARGER_POWER_KW) * 60)} minutes</p>
                    </div>
                   <div className="pt-2 text-center">
                    <p className="text-xs text-muted-foreground">{scannedData.description}</p>
                  </div>
                </CardContent>
              </Card>
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
      
      <style jsx>{`
        @keyframes scanLine {
          0% { 
            transform: translateY(-100%); 
            opacity: 0;
          }
          50% { 
            opacity: 1; 
          }
          100% { 
            transform: translateY(400%); 
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
