
'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Camera, FileUp } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { extractLabData } from '@/ai/flows/extract-lab-data-flow';
import type { BatchRecords } from '@/context/app-context';
import { useApp } from '@/context/app-context';
import { ExtractedRecordReview } from './extracted-record-review';
import { isValid, parseISO } from 'date-fns';


type Step = 'initial' | 'loading' | 'review' | 'error';

export function UploadRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('initial');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [extractedData, setExtractedData] = React.useState<BatchRecords | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addBatchRecords } = useApp();
  
  const stopCameraStream = React.useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const resetState = React.useCallback(() => {
    setStep('initial');
    setErrorMessage('');
    setExtractedData(null);
    setIsCapturing(false);
    stopCameraStream();
    setHasCameraPermission(null);
  }, [stopCameraStream]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetState();
    }
  };

  const processImage = async (dataUri: string) => {
    setStep('loading');
    setErrorMessage('');
    try {
      const result = await extractLabData({ photoDataUri: dataUri });
      
      const hasAnyData = Object.keys(result).some(key => key !== 'patientName' && result[key as keyof Omit<BatchRecords, 'patientName'>] !== null);

      if (!hasAnyData) {
        setStep('error');
        setErrorMessage('Could not extract any lab data from the document. Please try a clearer image.');
        return;
      }
      
      const reportDate = result.hba1c?.date || result.fastingBloodGlucose?.date || result.vitaminD?.date || result.thyroid?.date;
      if (!reportDate || !isValid(parseISO(reportDate))) {
        setStep('error');
        setErrorMessage('The AI could not determine the date of the test from the report. Please ensure the date is visible and clear.');
        return;
      }
      
      setExtractedData(result);
      setStep('review');

    } catch (e) {
      console.error(e);
      setStep('error');
      setErrorMessage('An unexpected error occurred while analyzing the document.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      processImage(dataUri);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };
  
  const handleCameraClick = async () => {
    setIsCapturing(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
        });
    }
  };

  const handleCaptureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    const dataUri = canvas.toDataURL('image/jpeg');
    stopCameraStream();
    setIsCapturing(false);
    processImage(dataUri);
  };
  
  const handleSave = async (dataToSave: BatchRecords) => {
    setStep('loading');
    const { added, duplicates } = await addBatchRecords(dataToSave);
    
    let description = '';
    if (added.length > 0) {
      description += `Added: ${added.join(', ')}. `;
    }
    if (duplicates.length > 0) {
      description += `Duplicates found for: ${duplicates.join(', ')}.`;
    }

    toast({
      title: 'Records Processed',
      description: description || 'No new records were added.',
    });
    handleOpenChange(false);
  };

  const renderContent = () => {
    switch (step) {
      case 'initial':
      case 'error':
        return (
          <>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileUp className="mr-2 h-5 w-5" /> Upload File
              </Button>
              <Button variant="outline" onClick={handleCameraClick}>
                <Camera className="mr-2 h-5 w-5" /> Use Camera
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
            />
          </>
        );
      case 'loading':
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4">AI is analyzing...</p></div>;
      case 'review':
        return extractedData ? (
          <ExtractedRecordReview
            data={extractedData}
            onSave={handleSave}
            onCancel={resetState}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Result
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Upload & Extract Lab Result</DialogTitle>
          <DialogDescription>
            Upload a PDF or image of a lab report. The AI will extract the data for you to review and save.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 overflow-y-auto">
            {isCapturing ? (
                <div className="space-y-4">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    {hasCameraPermission === false && (
                         <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser settings to use this feature.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="flex justify-between">
                         <Button variant="ghost" onClick={() => {
                             setIsCapturing(false);
                             stopCameraStream();
                         }}>Cancel</Button>
                        <Button onClick={handleCaptureImage}>Capture Image</Button>
                    </div>
                </div>
            ) : renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
