
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, RefreshCcw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (blob: Blob) => void;
  isUploading: boolean;
}

export function CameraCaptureDialog({ open, onOpenChange, onCapture, isUploading }: CameraCaptureDialogProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const { toast } = useToast();
  const streamRef = React.useRef<MediaStream | null>(null);

  const cleanupCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);
  
  const resetState = React.useCallback(() => {
    cleanupCamera();
    setCapturedImage(null);
    setHasCameraPermission(null);
  }, [cleanupCamera]);


  React.useEffect(() => {
    if (open) {
      const getCameraPermission = async () => {
        try {
          // Request rear camera first, which is better for document scanning
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
          onOpenChange(false); // Close dialog if permission is denied
        }
      };
      getCameraPermission();
    } else {
      resetState();
    }
    
    return cleanupCamera;
  }, [open, onOpenChange, toast, resetState, cleanupCamera]);
  

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        cleanupCamera(); // Turn off camera after capture
      }
    } else {
        toast({
            variant: 'destructive',
            title: 'Capture Failed',
            description: 'Could not capture image. The camera may not be ready.',
        })
    }
  };

  const handleConfirm = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
        } else {
             toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'Could not process the captured image.',
            })
        }
      }, 'image/jpeg', 0.9); // Use high quality JPEG
    }
  };

  const handleRetake = () => {
    // Reset state and re-request camera
    setCapturedImage(null);
    setHasCameraPermission(null);
  };
  
  const handleDialogClose = (isOpen: boolean) => {
      if (!isOpen) {
          resetState();
      }
      onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Take a Profile Photo</DialogTitle>
          <DialogDescription>
            Center your face in the frame and take a picture.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="h-full w-full object-cover" />
          ) : (
            <>
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use this feature.
                        </AlertDescription>
                        </Alert>
                    </div>
                )}
            </>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <DialogFooter>
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={handleRetake} disabled={isUploading}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button onClick={handleConfirm} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : 'Confirm & Upload'}
              </Button>
            </>
          ) : (
            <Button onClick={handleCapture} disabled={!hasCameraPermission || isUploading}>
              <Camera className="mr-2 h-4 w-4" />
              Take Picture
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
