
'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Camera, FileUp, AlertTriangle, Pill, FileText, Check, ArrowRight } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { extractPatientName } from '@/ai/flows/extract-lab-data-flow';
import { extractBiomarkers } from '@/ai/flows/extract-biomarkers-flow';
import type { BatchRecords } from '@/context/app-context';
import { useApp } from '@/context/app-context';
import { ExtractedRecordReview } from './extracted-record-review';
import { getMedicationInfo } from '@/ai/flows/process-medication-flow';
import { MedicationReviewCard } from './medication-review-card';
import type { Medication, FoodInstruction } from '@/lib/types';
import type { MedicationInfoOutput } from '@/lib/ai-types';
import { Card, CardContent, CardHeader } from './ui/card';


type Step = 'initial' | 'upload' | 'loading' | 'confirmName' | 'reviewLab' | 'reviewMedication' | 'error';
type UploadType = 'lab' | 'medication';

export function UploadRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('initial');
  const [uploadType, setUploadType] = React.useState<UploadType | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [extractedData, setExtractedData] = React.useState<BatchRecords | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [medicationAiResult, setMedicationAiResult] = React.useState<MedicationInfoOutput | null>(null);
  const [medicationUserInput, setMedicationUserInput] = React.useState<{ userInput: string; frequency: string; foodInstructions?: FoodInstruction; } | null>(null);
  const [patientName, setPatientName] = React.useState<string | null>(null);
  const [uploadedFileUri, setUploadedFileUri] = React.useState<string | null>(null);
  
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
    setUploadType(null);
    setErrorMessage('');
    setExtractedData(null);
    setIsCapturing(false);
    stopCameraStream();
    setHasCameraPermission(null);
    setMedicationAiResult(null);
    setMedicationUserInput(null);
    setPatientName(null);
    setUploadedFileUri(null);
  }, [stopCameraStream]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetState();
    }
  };

  const processFileForName = async (dataUri: string) => {
    setStep('loading');
    setUploadedFileUri(dataUri);
    setErrorMessage('');
    
    if (uploadType === 'medication') {
        processFileForMedication(dataUri);
        return;
    }

    try {
      const result = await extractPatientName({ photoDataUri: dataUri });
      setPatientName(result.patientName || 'Not Found');
      setStep('confirmName');
    } catch (e) {
      console.error(e);
      setStep('error');
      setErrorMessage('The AI could not read the patient name from the document. Please try a clearer image.');
    }
  };
  
  const processFileForBiomarkers = async () => {
    if (!uploadedFileUri) {
        setStep('error');
        setErrorMessage('File missing. Please re-upload.');
        return;
    }
    setStep('loading');
    try {
        const result = await extractBiomarkers({ photoDataUri: uploadedFileUri });
        setExtractedData(result);
        setStep('reviewLab');
    } catch(e) {
        console.error(e);
        setStep('error');
        setErrorMessage('Failed to extract biomarker data. The document might be unclear or not a valid lab report.');
    }
  }

  const processFileForMedication = async (dataUri: string) => {
    if (!profile) {
      setStep('error');
      setErrorMessage('A patient profile must be loaded to process medications.');
      return;
    }
    setStep('loading');
    try {
      const result = await extractPatientName({ photoDataUri: dataUri }); // patientName field here is repurposed for medication name
      if (result.patientName) {
        const userInput = result.patientName;
        setMedicationUserInput({ userInput, frequency: '' });
        toast({ title: "Processing Medication...", description: `AI is analyzing "${userInput}".` });
        const medInfo = await getMedicationInfo({ userInput, country: profile.country });
        setMedicationAiResult(medInfo);
        setStep('reviewMedication');
      } else {
        setStep('error');
        setErrorMessage('The AI could not recognize a medication in the image. Please try a clearer picture.');
      }
    } catch (e) {
      console.error(e);
      setStep('error');
      setErrorMessage('An unexpected error occurred while analyzing the medication image.');
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      processFileForName(dataUri);
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
    processFileForName(dataUri);
  };
  
  const handleSaveLabReport = async (dataToSave: BatchRecords) => {
    setStep('loading');
    const { added, duplicates } = await addBatchRecords(dataToSave);
    
    let description = '';
    if (added.length > 0) {
      description += `Added: ${added.join(', ')}. `;
    }
    if (duplicates.length > 0) {
      description += `Skipped duplicates for: ${duplicates.join(', ')}.`;
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

  const handleSetUploadType = (type: UploadType) => {
    setUploadType(type);
    setStep('upload');
  }

  const renderContent = () => {
    switch (step) {
      case 'initial':
         return (
             <div className="text-center space-y-4">
                <p className="text-muted-foreground">What would you like to upload?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => handleSetUploadType('lab')}>
                        <FileText className="h-8 w-8" />
                        <span>Lab Report</span>
                    </Button>
                     <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => handleSetUploadType('medication')}>
                        <Pill className="h-8 w-8" />
                        <span>Medication</span>
                    </Button>
                </div>
            </div>
        );
      case 'upload':
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
            <div className="pt-4">
                <Button variant="link" size="sm" onClick={() => setStep('initial')}>&larr; Back</Button>
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
        if (!profile) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>No patient profile is loaded. Please create or load a profile first.</AlertDescription>
                </Alert>
            );
        }
        const nameMismatch = patientName && patientName.toLowerCase() !== profile.name.toLowerCase();
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Confirm Patient Name</CardTitle>
                    <p className="text-sm text-muted-foreground">The AI found the following name on the document. Please confirm it's correct before proceeding.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {nameMismatch && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Warning: This name (<strong>{patientName}</strong>) does not match the current patient profile (<strong>{profile.name}</strong>).
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="text-center text-lg font-bold p-4 bg-muted rounded-md">
                        {patientName}
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <Button variant="ghost" onClick={resetState}>Re-upload</Button>
                        <Button onClick={processFileForBiomarkers}>
                            Confirm & Extract Data <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
      case 'reviewLab':
        return extractedData ? (
          <ExtractedRecordReview
            data={extractedData}
            profile={profile}
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
        <Button size="sm" variant="outline">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Result
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Upload & Extract Data</DialogTitle>
          <DialogDescription>
            Upload a PDF or an image of a lab report or medication. The AI will extract the data for you.
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
