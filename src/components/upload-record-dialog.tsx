

'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Camera, FileUp, Check, ArrowLeft, User } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useApp } from '@/context/app-context';
import { ExtractLabResultsInput, extractLabResults, ExtractLabResultsOutput } from '@/ai/flows/extract-lab-results-flow';
import { DatePicker } from './ui/date-picker';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { parseISO, isValid } from 'date-fns';
import { Label } from './ui/label';
import { availableBiomarkerCards } from '@/lib/biomarker-cards';
import { BiomarkerKey } from '@/lib/types';
import type { BatchRecords } from '@/context/app-context';


type Step = 'initial' | 'confirmName' | 'editResults' | 'loading' | 'error';
type ExtractedResult = ExtractLabResultsOutput['results'][0];

export function UploadRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('initial');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [extractedData, setExtractedData] = React.useState<ExtractLabResultsOutput | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { profile, addBatchRecords } = useApp();

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
    setIsCapturing(false);
    setIsLoading(false);
    setExtractedData(null);
    stopCameraStream();
  }, [stopCameraStream]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetState();
    }
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload a file smaller than 4MB.',
      });
      return;
    }
    
    setIsLoading(true);
    setStep('loading');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const enabledBiomarkers = Object.values(profile.enabledBiomarkers || {}).flat();
        const requiredBiomarkers = enabledBiomarkers.length > 0 ? enabledBiomarkers.map(key => availableBiomarkerCards[key as BiomarkerKey]?.label).filter(Boolean) : Object.values(availableBiomarkerCards).map(b => b.label);

        const result = await extractLabResults({ 
            photoDataUri: base64data,
            requiredBiomarkers,
        });
        
        setExtractedData(result);
        setStep('confirmName');
      } catch (error) {
        console.error('AI extraction failed:', error);
        setErrorMessage('The AI failed to analyze the document. Please ensure it is a clear lab report and try again.');
        setStep('error');
      } finally {
        setIsLoading(false);
      }
    };
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('Could not access the camera. Please check your browser permissions.');
      setStep('error');
    }
  };
  
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
        if (blob) {
            handleFileChange(new File([blob], "capture.png", { type: "image/png" }));
        }
    }, 'image/png');
  };

  const handleEditResult = (index: number, field: keyof ExtractedResult, value: string | number) => {
    if (!extractedData) return;
    const newResults = [...extractedData.results];
    (newResults[index] as any)[field] = value;
    setExtractedData({ ...extractedData, results: newResults });
  };
  
  const handleSaveChanges = async () => {
    if (!extractedData) return;
    setIsLoading(true);

    const recordsToBatch: BatchRecords = {};
    const date = extractedData.testDate;

    const findKeyByLabel = (label: string): BiomarkerKey | undefined => {
        const lowercasedInput = label.toLowerCase().trim();
        return Object.keys(availableBiomarkerCards).find(key => {
            const cardInfo = availableBiomarkerCards[key as BiomarkerKey];
            if (!cardInfo) return false;
            const lowercasedLabel = cardInfo.label.toLowerCase().trim();
            const mainLabel = cardInfo.label.split('(')[0].trim().toLowerCase();
            return lowercasedLabel === lowercasedInput || mainLabel === lowercasedInput || lowercasedLabel.includes(lowercasedInput);
        }) as BiomarkerKey | undefined;
    };
    
    const lipidPanelData: any = { date };
    let hasLipidData = false;

    extractedData.results.forEach(res => {
        const value = Number(res.value);
        if (isNaN(value)) return;

        const biomarkerKey = findKeyByLabel(res.biomarker);
        
        if (!biomarkerKey) return;
        
        const keyHandlers: Record<BiomarkerKey, () => void> = {
            totalCholesterol: () => { lipidPanelData.totalCholesterol = value; hasLipidData = true; },
            ldl: () => { lipidPanelData.ldl = value; hasLipidData = true; },
            hdl: () => { lipidPanelData.hdl = value; hasLipidData = true; },
            triglycerides: () => { lipidPanelData.triglycerides = value; hasLipidData = true; },
            hba1c: () => { recordsToBatch.hba1c = { date, value }; },
            glucose: () => { recordsToBatch.fastingBloodGlucose = { date, value }; },
            vitaminD: () => { recordsToBatch.vitaminD = { date, value, units: res.unit }; },
            thyroid: () => { recordsToBatch.thyroid = { ...recordsToBatch.thyroid, date, tsh: value }; },
            hemoglobin: () => { recordsToBatch.hemoglobin = { date, hemoglobin: value }; },
            bloodPressure: () => { /* Not typically from lab reports */ },
            weight: () => { /* Not typically from lab reports */ },
        };
        
        keyHandlers[biomarkerKey]?.();
    });

    if (hasLipidData && Object.keys(lipidPanelData).length > 1) {
        recordsToBatch.lipidPanel = lipidPanelData;
    }

    try {
        const result = await addBatchRecords(recordsToBatch);
        let description = '';
        if (result.added.length > 0) {
            description += `Added: ${result.added.join(', ')}. `;
        }
        if (result.duplicates.length > 0) {
            description += `Skipped duplicates: ${result.duplicates.join(', ')}.`;
        }
        if (description) {
            toast({ title: 'Records Processed', description });
        } else {
            toast({ title: 'No New Records Added', description: 'All extracted records were already present or could not be mapped.' });
        }
        handleOpenChange(false);
    } catch (e) {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not save the records.' });
    } finally {
        setIsLoading(false);
    }
}


  const renderContent = () => {
    switch (step) {
      case 'initial':
      case 'error':
        return (
          <>
            {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileUp className="mr-2 h-5 w-5" /> Upload File
              </Button>
              <Button variant="outline" onClick={startCamera}>
                <Camera className="mr-2 h-5 w-5" /> Use Camera
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
              accept="image/*,application/pdf"
            />
          </>
        );
      case 'loading':
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4">AI is analyzing...</p></div>;
      
      case 'confirmName':
        return (
          <div className="space-y-4">
            <Alert>
              <User className="h-4 w-4" />
              <AlertTitle>Confirm Patient Name</AlertTitle>
              <AlertDescription>
                The AI identified the name on this document as <span className="font-bold">{extractedData?.patientName}</span>. Does this match the current patient, <span className="font-bold">{profile.name}</span>?
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={resetState}>Cancel</Button>
              <Button onClick={() => setStep('editResults')}>
                <Check className="mr-2 h-4 w-4" /> Yes, Continue
              </Button>
            </div>
          </div>
        );
      
      case 'editResults':
          if (!extractedData) return null;
          const { testDate, results } = extractedData;
        return (
            <div className="space-y-4">
                 <div className="space-y-1">
                    <Label>Patient Name</Label>
                    <Input value={extractedData.patientName} readOnly disabled/>
                </div>
                 <ScrollArea className="h-64 border rounded-md p-2">
                    <div className="space-y-4 p-2">
                         <div className="space-y-1">
                            <Label>Test Date</Label>
                            <DatePicker 
                                value={testDate && isValid(parseISO(testDate)) ? parseISO(testDate) : new Date()}
                                onChange={(date) => setExtractedData({...extractedData, testDate: date?.toISOString() || ''})}
                            />
                        </div>
                        {results.length > 0 ? results.map((res, index) => (
                             <div key={index} className="grid grid-cols-5 gap-2 items-center">
                                <Input 
                                    aria-label="Biomarker Name"
                                    className="col-span-3"
                                    value={res.biomarker} 
                                    onChange={(e) => handleEditResult(index, 'biomarker', e.target.value)} />
                                <Input 
                                    aria-label="Biomarker Value"
                                    type="number" 
                                    className="col-span-1"
                                    value={res.value} 
                                    onChange={(e) => handleEditResult(index, 'value', e.target.value)} />
                                <Input 
                                    aria-label="Biomarker Unit"
                                    className="col-span-1"
                                    value={res.unit} 
                                    onChange={(e) => handleEditResult(index, 'unit', e.target.value)} />
                            </div>
                        )) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No relevant biomarkers were found on the document.</p>
                          </div>
                        )}
                    </div>
                 </ScrollArea>
                  <div className="flex justify-between gap-2">
                     <Button variant="ghost" onClick={() => setStep('confirmName')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                     </Button>
                    <Button onClick={handleSaveChanges} disabled={isLoading || results.length === 0}>
                       {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                       Enter
                    </Button>
                </div>
            </div>
        )
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
                    <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="flex justify-between">
                         <Button variant="ghost" onClick={() => {
                             setIsCapturing(false);
                             stopCameraStream();
                         }}>Cancel</Button>
                        <Button onClick={captureImage}>Capture Image</Button>
                    </div>
                </div>
            ) : renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

