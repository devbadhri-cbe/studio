'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Camera, FileUp, UserCheck, AlertTriangle } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { extractLabData } from '@/ai/flows/extract-lab-data-flow';
import type { BatchRecords } from '@/context/app-context';
import { useApp } from '@/context/app-context';
import { ExtractedRecordReview } from './extracted-record-review';
import { isValid, parseISO } from 'date-fns';
import { getMedicationInfo } from '@/ai/flows/process-medication-flow';
import { MedicationReviewCard } from './medication-review-card';
import type { Medication, FoodInstruction } from '@/lib/types';
import type { MedicationInfoOutput } from '@/lib/ai-types';


type Step = 'initial' | 'loading' | 'confirmName' | 'reviewLab' | 'reviewMedication' | 'error';

export function UploadRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('initial');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [extractedData, setExtractedData] = React.useState<BatchRecords | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [medicationAiResult, setMedicationAiResult] = React.useState<MedicationInfoOutput | null>(null);
  const [medicationUserInput, setMedicationUserInput] = React.useState<{ userInput: string; frequency: string; foodInstructions?: FoodInstruction; } | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addBatchRecords, profile, addMedication } = useApp();
  
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
    setMedicationAiResult(null);
    setMedicationUserInput(null);
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
      
      const isMedication = result.medicationName && result.dosage;
      const isLabReport = Object.keys(result).some(key => !['patientName', 'medicationName', 'dosage', 'activeIngredient'].includes(key) && result[key as keyof Omit<BatchRecords, 'patientName'>] !== null && result[key as keyof Omit<BatchRecords, 'patientName'>] !== undefined);

      if (isMedication) {
        const userInput = `${result.medicationName} ${result.dosage}`;
        setMedicationUserInput({ userInput, frequency: '' });
        
        toast({ title: "Processing Medication...", description: `AI is analyzing "${userInput}".` });
        const medInfo = await getMedicationInfo({
          userInput,
          country: profile.country,
        });
        setMedicationAiResult(medInfo);
        setStep('reviewMedication');

      } else if (isLabReport) {
        const reportDate = result.hba1c?.date || result.fastingBloodGlucose?.date || result.thyroid?.date;
        if (!reportDate || !isValid(parseISO(reportDate))) {
          setStep('error');
          setErrorMessage('The AI could not determine the date of the test from the report. Please ensure the date is visible and clear.');
          return;
        }
        setExtractedData(result);
        setStep('confirmName');
      } else {
        setStep('error');
        setErrorMessage('Could not extract any recognizable data from the document. Please try a clearer image.');
        return;
      }

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
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
                description: 'Please enable camera permissions in your browser settings.',
            });
        }
    } else {
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
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
  
  const handleSaveLabReport = async (dataToSave: BatchRecords) => {
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
  
  const handleSaveMedication = (confirmedData: { aiResult: MedicationInfoOutput, userInput: { userInput: string, frequency: string, foodInstructions?: FoodInstruction } }) => {
      const { aiResult, userInput: finalUserInput } = confirmedData;
      const newMedication: Omit<Medication, 'id'> = {
          name: aiResult.activeIngredient,
          userInput: finalUserInput.userInput,
          dosage: aiResult.dosage || '',
          frequency: aiResult.frequency || finalUserInput.frequency,
          foodInstructions: aiResult.foodInstructions || finalUserInput.foodInstructions,
          status: 'processed',
          ...aiResult,
      };
      addMedication(newMedication);
      toast({ title: "Medication Saved", description: `${aiResult.activeIngredient} has been added to your list.`});
      
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
      case 'confirmName':
        const nameOnReport = extractedData?.patientName || "Not Found";
        const nameOnProfile = profile.name;
        const namesMatch = nameOnReport.toLowerCase() === nameOnProfile.toLowerCase();

        return (
            <div className="space-y-4 text-center">
                <UserCheck className="mx-auto h-12 w-12 text-primary" />
                <h3 className="text-lg font-semibold">Confirm Patient Name</h3>
                <p className="text-sm text-muted-foreground">
                    Please confirm the name on the lab report matches the patient profile.
                </p>
                <div className="space-y-2 rounded-lg border p-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Name on Report:</span>
                        <span className="font-semibold">{nameOnReport}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Patient Profile:</span>
                        <span className="font-semibold">{nameOnProfile}</span>
                    </div>
                </div>
                {!namesMatch && (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Warning: The names do not match. Proceeding will add these records to <strong>{nameOnProfile}</strong>'s profile.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={resetState}>Cancel</Button>
                    <Button onClick={() => setStep('reviewLab')}>Confirm & Proceed</Button>
                </div>
            </div>
        );
      case 'reviewLab':
        return extractedData ? (
          <ExtractedRecordReview
            data={extractedData}
            onSave={handleSaveLabReport}
            onCancel={resetState}
          />
        ) : null;
      case 'reviewMedication':
        return medicationAiResult && medicationUserInput ? (
            <MedicationReviewCard 
                userInput={medicationUserInput}
                aiResult={medicationAiResult}
                onConfirm={handleSaveMedication}
                onEdit={handleSaveMedication} // Edit also confirms and saves
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
          <DialogTitle>Upload & Extract Data</DialogTitle>
          <DialogDescription>
            Upload a PDF or image of a lab report or medication. The AI will extract the data for you.
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
                        <Button onClick={handleCaptureImage} disabled={!hasCameraPermission}>Capture Image</Button>
                    </div>
                </div>
            ) : renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

    