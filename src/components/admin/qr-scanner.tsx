"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Camera, CameraOff, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Registration } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { checkInRider } from '@/app/actions';
import { Badge } from '../ui/badge';


type ScannedQrData = {
  registrationId: string;
  rider: 1 | 2;
};

export function QrScanner() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedQrData | null>(null);
  const [scannedRegistration, setScannedRegistration] = useState<Registration | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  
  const { toast } = useToast();

  const getCameraPermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported by your browser.');
        setHasCameraPermission(false);
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      setError('Camera permission denied. Please enable it in your browser settings.');
    }
  };
  
  const stopScan = useCallback(() => {
    setIsScanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startScan = async () => {
    await getCameraPermission();
    setError(null);
    setScannedData(null);
    setScannedRegistration(null);
    setIsScanning(true);
  };

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          stopScan();
          try {
            const data = JSON.parse(code.data) as ScannedQrData;
            if (data.registrationId && data.rider) {
                setScannedData(data);
            } else {
                throw new Error("Invalid QR code format.");
            }
          } catch(e) {
            setError("Invalid QR code. Please scan a valid ride ticket.");
          }
        }
      }
    }
    if (isScanning) {
        animationFrameId.current = requestAnimationFrame(tick);
    }
  }, [isScanning, stopScan]);

  useEffect(() => {
    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(tick);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isScanning, tick]);

  useEffect(() => {
    if (scannedData) {
        const fetchRegistration = async () => {
            setIsFetching(true);
            setError(null);
            try {
                const docRef = doc(db, 'registrations', scannedData.registrationId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setScannedRegistration({ id: docSnap.id, ...docSnap.data() } as Registration);
                } else {
                    setError('Registration not found.');
                }
            } catch (err) {
                setError('Failed to fetch registration data.');
            } finally {
                setIsFetching(false);
            }
        };
        fetchRegistration();
    }
  }, [scannedData]);
  
  const handleCheckIn = async () => {
    if (!scannedData || !scannedRegistration) return;
    setIsCheckingIn(true);
    const result = await checkInRider({
        registrationId: scannedData.registrationId,
        riderNumber: scannedData.rider,
    });
    if (result.success) {
        toast({
            title: "Success",
            description: result.message,
            action: <UserCheck className="text-primary" />,
        });
        setScannedRegistration(null); // Close dialog
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsCheckingIn(false);
  }

  const riderIsCheckedIn = scannedRegistration && scannedData ? 
    (scannedData.rider === 1 ? scannedRegistration.rider1CheckedIn : scannedRegistration.rider2CheckedIn)
    : false;

  return (
    <div className="space-y-4">
        {!isScanning ? (
            <Button onClick={startScan} className="w-full">
                <Camera className="mr-2 h-4 w-4" /> Start Scanning
            </Button>
        ) : (
            <Button onClick={stopScan} variant="outline" className="w-full">
                <CameraOff className="mr-2 h-4 w-4" /> Stop Scanning
            </Button>
        )}

        <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {isScanning && (
                <div className="absolute inset-0 border-8 border-primary/50 rounded-md animate-pulse" />
            )}
             {hasCameraPermission === false && !isScanning && (
                <div className="text-muted-foreground text-center p-4">
                    <CameraOff className="h-10 w-10 mx-auto mb-2" />
                    <p>Camera not available</p>
                </div>
            )}
        </div>
        
        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Scan Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

        <AlertDialog open={!!scannedRegistration && !isFetching} onOpenChange={() => setScannedRegistration(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Rider Details</AlertDialogTitle>
                    <AlertDialogDescription>
                        {scannedRegistration?.status !== 'approved' && <Badge variant="destructive" className="mb-2">Registration Not Approved!</Badge>}
                        Verify rider information before check-in.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {isFetching ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : scannedRegistration && (
                    <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {scannedData?.rider === 1 ? scannedRegistration.fullName : scannedRegistration.fullName2}</p>
                        <p><strong>Age:</strong> {scannedData?.rider === 1 ? scannedRegistration.age : scannedRegistration.age2}</p>
                        <p><strong>Phone:</strong> {scannedData?.rider === 1 ? scannedRegistration.phoneNumber : scannedRegistration.phoneNumber2}</p>
                        <p><strong>Status:</strong> {riderIsCheckedIn ? <Badge className="bg-green-100 text-green-800">Already Checked-in</Badge> : <Badge variant="secondary">Not Checked-in</Badge>}</p>
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleCheckIn} 
                        disabled={isCheckingIn || riderIsCheckedIn || scannedRegistration?.status !== 'approved'}
                    >
                        {isCheckingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {riderIsCheckedIn ? 'Checked In' : 'Mark as Checked-in'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
