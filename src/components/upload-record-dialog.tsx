
'use client';

import { labResultUpload, type LabResultUploadOutput } from '@/ai/flows/lab-result-upload';
import { extractPatientName } from '@/ai/flows/extract-patient-name';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, CheckCircle, XCircle, FileText, FlaskConical, Sun, Droplet, Activity, Zap, AlertTriangle, UserCheck, UserX, AlertCircle } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';


type UploadStep = 'initial' | 'extractingName' | 'confirmingName' | 'extractingData' | 'complete';

interface UploadRecordDialogProps {
  children?: React.ReactNode;
  onExtractionComplete: (data: LabResultUploadOutput) => void;
}

export function UploadRecordDialog({ children, onExtractionComplete }: UploadRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [uploadStep, setUploadStep] = React.useState<UploadStep>('initial');
  const [extractedName, setExtractedName] = React.useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = React.useState<string | null>(null);
  const { profile } = useApp();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  React.useEffect(() => {
    // Reset state when dialog is closed
    if (!open) {
      setUploadStep('initial');
      setExtractedName(null);
      setPhotoDataUri(null);
    }
  }, [open]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!profile.name) {
      toast({
        variant: 'destructive',
        title: 'Profile Name Required',
        description: 'Please set your name in the profile before uploading a lab result.',
      });
      setOpen(false);
      return;
    }

    setUploadStep('extractingName');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      setPhotoDataUri(dataUri);
      try {
        const result = await extractPatientName({ photoDataUri: dataUri });
        setExtractedName(result.patientName);
        setUploadStep('confirmingName');

      } catch (error) {
        console.error('Error extracting patient name:', error);
        toast({
          variant: 'destructive',
          title: 'Extraction Failed',
          description: 'Could not extract a name from the document. Please try again.',
        });
        setUploadStep('initial');
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'There was an issue reading your file.',
      });
      setUploadStep('initial');
    };
  };

  const handleNameConfirmation = async () => {
    if (!photoDataUri) return;
    setUploadStep('extractingData');
    try {
        const result = await labResultUpload({ photoDataUri });
        onExtractionComplete(result);
        setOpen(false); // Close the dialog and let the parent handle the form
    } catch (error) {
        console.error('Error processing lab result:', error);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'Could not extract information from the lab result. Please try again or enter it manually.',
        });
        setUploadStep('confirmingName');
    }
  };


  const renderInitialView = () => (
    <div className="flex-1 p-6">
      <Alert>
        <AlertTitle>Important!</AlertTitle>
        <AlertDescription>
          For best results, use a clear, uncropped image or a text-based PDF of your lab report. Ensure your name, the test date, and all relevant biomarker values are visible.
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex items-center justify-center">
        <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
        />
        <Button variant="default" size="sm" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Choose File
        </Button>
      </div>
    </div>
  );

  const renderLoadingView = (message: string) => (
     <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground h-40 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>{message}</p>
        <p className="text-xs">This may take a moment.</p>
    </div>
  );
  
  const renderNameConfirmationView = () => {
    if (!extractedName) return null;
    return (
        <>
           <div className="flex-1 space-y-4 p-6">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Confirm Patient Name</AlertTitle>
                    <AlertDescription>
                        Please verify that the name extracted from the document matches the patient's profile before proceeding.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                        <UserCheck className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="font-semibold">Profile Name</p>
                            <p className="text-sm text-muted-foreground">{profile.name}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                        <UserX className="h-5 w-5 text-primary" />
                        <div>
                            <p className="font-semibold">Extracted Name</p>
                            <p className="text-sm text-muted-foreground">{extractedName}</p>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter className="p-6 pt-0">
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleNameConfirmation}>Yes, this is correct. Proceed.</Button>
            </DialogFooter>
        </>
    );
  }

  const renderContent = () => {
    switch (uploadStep) {
        case 'initial':
            return renderInitialView();
        case 'extractingName':
            return renderLoadingView('Extracting name...');
        case 'confirmingName':
            return renderNameConfirmationView();
        case 'extractingData':
            return renderLoadingView('Analyzing your document...');
        default:
            return null;
    }
  }

  const getDialogDescription = () => {
      switch (uploadStep) {
          case 'initial':
              return 'Let AI read your lab result. It will extract HbA1c, Lipids, Vitamin D, and Thyroid values.';
          case 'confirmingName':
              return 'Please confirm the patient name before proceeding.';
          case 'extractingData':
              return 'The AI is analyzing your report. This might take a moment.';
          default:
              return '';
      }
  }

  const defaultTrigger = (
    <Tooltip>
        <TooltipTrigger asChild>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline">
                    <UploadCloud className="h-4 w-4" />
                    <span className="sr-only">Upload Result</span>
                </Button>
            </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
            <p>Upload Result</p>
        </TooltipContent>
  </Tooltip>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || defaultTrigger}
        </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Upload Lab Result</DialogTitle>
          <DialogDescription>
             {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
