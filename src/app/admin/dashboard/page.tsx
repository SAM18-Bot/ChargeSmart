'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { LogOut, QrCode, Zap, Clock, User, Bell, AlertTriangle, Camera, CheckCircle, XCircle, RefreshCw, Settings } from 'lucide-react';

export default function AdminDashboardPreview() {
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState([]);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Mock data
  const admin = { stationId: "CHG-001" };
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings([
      {
        id: 1,
        userName: "John Doe",
        date: new Date(Date.now() + 3600000).toISOString(),
        status: "pending",
        kwh: 25.5,
        cost: 382.5
      },
      {
        id: 2,
        userName: "Jane Smith",
        date: new Date(Date.now() + 7200000).toISOString(),
        status: "active",
        kwh: 18.2,
        cost: 273.0
      }
    ]);
  }, []);

  const addDebugInfo = (message) => {
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const detectCameras = async () => {
    try {
      addDebugInfo('Detecting available cameras...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      setAvailableCameras(videoDevices);
      addDebugInfo(`Found ${videoDevices.length} camera(s)`);
      
      return videoDevices;
    } catch (error) {
      addDebugInfo(`Camera detection failed: ${error.message}`);
      return [];
    }
  };

  const requestPermissionFirst = async () => {
    try {
      addDebugInfo('Requesting basic camera permission...');
      
      // First, request basic permission
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Stop it immediately, we just wanted permission
      tempStream.getTracks().forEach(track => track.stop());
      
      addDebugInfo('Basic permission granted');
      return true;
    } catch (error) {
      addDebugInfo(`Permission request failed: ${error.name}`);
      return false;
    }
  };

  const startCamera = async (cameraId = null, forceRetry = false) => {
    if (!forceRetry && isInitializing) return;
    
    setIsInitializing(true);
    setCameraError(null);
    
    const currentRetry = forceRetry ? 0 : retryCount;
    setRetryCount(currentRetry + 1);

    try {
      addDebugInfo('Starting camera initialization...');

      // Check basic browser support
      if (!navigator.mediaDevices) {
        throw new Error('MediaDevices not supported. Try Chrome, Firefox, or Safari.');
      }

      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported. Update your browser.');
      }

      // Detect cameras first
      const cameras = await detectCameras();
      
      // Request basic permission if we don't have it
      const hasPermission = await requestPermissionFirst();
      if (!hasPermission) {
        throw new Error('Camera permission denied by user');
      }

      // Re-detect cameras after permission (they should have labels now)
      await detectCameras();

      // Define constraint sets to try
      const constraintSets = [];
      
      // If specific camera requested
      if (cameraId) {
        constraintSets.push({
          video: { deviceId: { exact: cameraId }, width: { ideal: 640 }, height: { ideal: 480 } }
        });
      }

      // Add various fallback constraints
      constraintSets.push(
        // Rear camera exact
        { video: { facingMode: { exact: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } } },
        // Rear camera preferred  
        { video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } },
        // Front camera
        { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } },
        // Any camera with resolution
        { video: { width: { ideal: 640 }, height: { ideal: 480 } } },
        // Any camera with lower resolution
        { video: { width: { ideal: 320 }, height: { ideal: 240 } } },
        // Minimal constraints
        { video: true }
      );

      let stream = null;
      let workingConstraints = null;

      for (let i = 0; i < constraintSets.length; i++) {
        const constraints = constraintSets[i];
        
        try {
          addDebugInfo(`Trying constraint set ${i + 1}/${constraintSets.length}`);
          console.log('Trying constraints:', constraints);
          
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          workingConstraints = constraints;
          addDebugInfo(`Success with constraint set ${i + 1}`);
          break;
          
        } catch (error) {
          addDebugInfo(`Constraint set ${i + 1} failed: ${error.name}`);
          
          if (error.name === 'NotAllowedError' && i === 0) {
            // If first attempt fails with permission, don't try others
            throw error;
          }
          continue;
        }
      }

      if (!stream) {
        throw new Error('All camera constraint attempts failed');
      }

      // Store the stream
      streamRef.current = stream;
      
      // Get video track info
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        addDebugInfo(`Using: ${videoTrack.label} (${settings.width}x${settings.height})`);
      }

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Handle video events
        const video = videoRef.current;
        
        const handleLoadedMetadata = () => {
          addDebugInfo('Video metadata loaded');
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
        
        const handleCanPlay = () => {
          addDebugInfo('Video can play');
          video.removeEventListener('canplay', handleCanPlay);
        };
        
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        
        // Start playing
        try {
          await video.play();
          addDebugInfo('Video playing successfully');
        } catch (playError) {
          addDebugInfo(`Video play error: ${playError.message}`);
          // Try to play anyway, some browsers are strict
        }
      }
      
      setHasCameraPermission(true);
      setIsInitializing(false);
      addDebugInfo('Camera setup complete!');
      
    } catch (error) {
      console.error('Camera error:', error);
      addDebugInfo(`Fatal error: ${error.message}`);
      
      setHasCameraPermission(false);
      setIsInitializing(false);
      
      // Detailed error messages
      let errorMessage = '';
      
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage = 'Camera permission denied. Please click the camera icon in your browser\'s address bar and allow camera access, then refresh the page.';
          break;
        case 'NotFoundError':
          errorMessage = 'No camera found. Please connect a camera and refresh the page.';
          break;
        case 'NotSupportedError':
          errorMessage = 'Camera not supported. Please use Chrome, Firefox, Safari, or Edge browser.';
          break;
        case 'NotReadableError':
          errorMessage = 'Camera is busy. Please close other applications using the camera and try again.';
          break;
        case 'OverconstrainedError':
          errorMessage = 'Camera settings not supported. Trying with basic settings...';
          break;
        case 'SecurityError':
          errorMessage = 'Camera blocked by security policy. Please enable camera access in browser settings.';
          break;
        default:
          errorMessage = `Camera error: ${error.message}. Try refreshing the page or using a different browser.`;
      }
      
      setCameraError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        addDebugInfo(`Stopped ${track.kind} track`);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasCameraPermission(null);
    setCameraError(null);
    setRetryCount(0);
    setDebugInfo([]);
  };

  const startScanner = () => {
    setScannerOpen(true);
    setDebugInfo([]);
    addDebugInfo('Scanner opened');
    setTimeout(() => startCamera(), 100); // Small delay to ensure dialog is open
  };

  const stopScanner = () => {
    setScannerOpen(false);
    setScannedData(null);
    stopCamera();
    setIsInitializing(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const simulateQRScan = () => {
    const mockQRData = {
      bookingId: "BK-001",
      user: "John Doe",
      kwh: 25.5,
      chargerId: "CHG-001"
    };
    setScannedData(mockQRData);
    stopScanner();
  };

  const confirmChargeStart = () => {
    alert(`Charge started for ${scannedData.user}!`);
    setScannedData(null);
  };

  const openCameraSettings = () => {
    alert('To fix camera issues:\n\n1. Check browser permissions (click 🔒 or camera icon in address bar)\n2. Refresh this page\n3. Close other apps using camera\n4. Try different browser\n5. Restart browser\n6. Check system camera settings');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Managing Station: {admin.stationId}</p>
        </div>
        <div className='flex items-center gap-4'>
          <Button onClick={startScanner} className="bg-primary hover:bg-primary/90">
            <QrCode className="mr-2 h-4 w-4" />
            Scan Ticket
          </Button>
          <Button variant="outline">
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
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-b hover:bg-muted">
                      <td className='p-3 font-medium'>{booking.userName}</td>
                      <td className='p-3'>{new Date(booking.date).toLocaleString()}</td>
                      <td className='p-3'>
                        <Badge variant={booking.status === 'pending' ? 'secondary' : 'default'} 
                               className={booking.status === 'active' ? 'bg-green-500 text-white' : ''}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className='p-3'>{booking.kwh.toFixed(2)}</td>
                      <td className='p-3'>₹{booking.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* QR Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={stopScanner}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scan User Ticket</DialogTitle>
            <DialogDescription>
              Point the camera at the QR code on the user's device.
            </DialogDescription>
          </DialogHeader>
          
          <div className='bg-muted rounded-lg overflow-hidden aspect-square relative flex items-center justify-center border-2 border-dashed border-border'>
            
            {/* Real Camera Video Feed */}
            {hasCameraPermission && !isInitializing && (
              <div className="w-full h-full relative">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  autoPlay 
                  muted 
                  playsInline
                  controls={false}
                />
                
                {/* QR Code Detection Overlay */}
                <div className="absolute inset-8 border-2 border-primary rounded-lg pointer-events-none animate-pulse">
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary/70 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary/70 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary/70 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary/70 rounded-br-lg"></div>
                </div>
                
                {/* Instructions and Controls */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-white p-3 rounded-lg">
                  <p className="text-xs mb-2 text-center">Hold steady - Scanning for QR code...</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={simulateQRScan}
                      className="bg-green-600 hover:bg-green-700 flex-1 text-xs"
                    >
                      Simulate Scan
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => startCamera(null, true)}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isInitializing && (
              <div className='absolute inset-0 flex items-center justify-center bg-background/95'>
                <div className='text-center p-4'>
                  <Camera className="h-12 w-12 mx-auto mb-3 animate-bounce text-primary" />
                  <p className='text-lg font-medium text-muted-foreground mb-2'>Starting Camera...</p>
                  <p className='text-sm text-muted-foreground mb-3'>Attempt {retryCount}</p>
                  <div className="w-32 h-1 bg-muted rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-pulse w-2/3"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Error State */}
            {hasCameraPermission === false && (
              <div className='absolute inset-0 flex items-center justify-center p-4 bg-background/95'>
                <div className="w-full max-w-sm">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Issue (Attempt {retryCount})</AlertTitle>
                    <AlertDescription className="mb-3 text-xs">
                      {cameraError}
                    </AlertDescription>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => startCamera(null, true)}
                          className="flex-1"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={openCameraSettings}
                          className="flex-1"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Help
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={simulateQRScan}
                        className="w-full"
                      >
                        Skip & Use Demo
                      </Button>
                    </div>
                  </Alert>
                </div>
              </div>
            )}

            {/* Initial State */}
            {hasCameraPermission === null && !isInitializing && (
              <div className='absolute inset-0 flex items-center justify-center p-4 bg-background/95'>
                <div className='text-center'>
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className='text-lg font-medium text-foreground mb-2'>Camera Ready</p>
                  <p className='text-sm text-muted-foreground mb-4'>Click to start camera and scan QR codes</p>
                  <Button 
                    onClick={() => startCamera()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Debug Info */}
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
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Secure Connection</span>
            </div>
            <div className="flex items-center gap-1">
              <Camera className="h-3 w-3 text-primary" />
              <span>Camera Required</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant='outline' onClick={stopScanner}>
              Close Scanner
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
              <div className='flex items-center gap-3 p-3 bg-muted rounded-md'>
                <User className='w-5 h-5 text-primary' />
                <div>
                  <p className='text-xs text-muted-foreground'>User</p>
                  <p className='font-bold'>{scannedData.user}</p>
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
                <Clock className='w-5 h-5 text-green-500' />
                <div>
                  <p className='text-xs text-muted-foreground'>Estimated Time</p>
                  <p className='font-bold'>
                    ~{Math.round((scannedData.kwh / 7.2) * 60)} minutes
                  </p>
                </div>
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
