
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
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { DatePicker } from './ui/date-picker';
import { parseISO, isValid } from 'date-fns';

type UploadStep = 'initial' | 'extractingName' | 'confirmingName' | 'extractingData' | 'confirmingData';

interface UploadRecordDialogProps {
  children?: React.ReactNode;
}

export function UploadRecordDialog({ children }: UploadRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [uploadStep, setUploadStep] = React.useState<UploadStep>('initial');
  const [extractedName, setExtractedName] = React.useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = React.useState<string | null>(null);
  const [extractedData, setExtractedData] = React.useState<LabResultUploadOutput | null>(null);
  const { addBatchRecords, profile, biomarkerUnit } = useApp();
  const { toast } = useToast();
  const formatDate = useDateFormatter();

  React.useEffect(() => {
    // Reset state when dialog is closed
    if (!open) {
      setUploadStep('initial');
      setExtractedName(null);
      setPhotoDataUri(null);
      setExtractedData(null);
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
        setExtractedData(result);
        setUploadStep('confirmingData');
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

  const handleDataConfirmation = async () => {
    if (!extractedData) return;

    const { hba1cValue, lipidPanel, vitaminDValue, vitaminDUnits, thyroidPanel, bloodPressure, date } = extractedData;
    
    if (!date || !isValid(parseISO(date))) {
        toast({
            variant: 'destructive',
            title: 'Valid Date Required',
            description: 'Please select a valid date for the report before saving.',
        });
        return;
    }
    
    const { added, duplicates } = await addBatchRecords({
      hba1c: hba1cValue ? { value: hba1cValue, date } : undefined,
      lipid: lipidPanel ? { ...lipidPanel, date, units: lipidPanel.units } : undefined,
      vitaminD: (vitaminDValue && vitaminDUnits) ? { value: vitaminDValue, date, units: vitaminDUnits } : undefined,
      thyroid: thyroidPanel ? { ...thyroidPanel, date } : undefined,
      bloodPressure: bloodPressure ? { ...bloodPressure, date } : undefined,
    });
    
    if (added.length > 0 && duplicates.length === 0) {
      toast({
        title: 'Records Added!',
        description: `${added.join(', ')} records have been updated successfully.`,
      });
    } else if (added.length > 0 && duplicates.length > 0) {
       toast({
        title: 'Some Records Added',
        description: `${added.join(', ')} were added. Duplicates for ${duplicates.join(', ')} were skipped.`,
      });
    } else if (added.length === 0 && duplicates.length > 0) {
        toast({
            variant: 'destructive',
            title: 'No New Records Added',
            description: `All extracted records for this date already exist: ${duplicates.join(', ')}.`,
        });
    } else {
         toast({
            variant: 'destructive',
            title: 'No Data to Add',
            description: 'No new information was found to add to your records.',
        });
    }

    setOpen(false);
  };

  const renderInitialView = () => (
    <div className="flex-1">
      <Alert>
        <AlertTitle>Important!</AlertTitle>
        <AlertDescription>
          For best results, use a clear, uncropped image or a text-based PDF of your lab report. Ensure your name, the test date, and all relevant biomarker values are visible.
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex items-center justify-center">
        <Button asChild variant="default" size="sm">
          <label htmlFor="file-upload">
            <UploadCloud className="mr-2 h-4 w-4" />
            Choose File
            <input id="file-upload" type="file" className="sr-only" accept="image/*,application/pdf" onChange={handleFileChange} />
          </label>
        </Button>
      </div>
    </div>
  );

  const renderLoadingView = (message: string) => (
     <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>{message}</p>
        <p className="text-xs">This may take a moment.</p>
    </div>
  );
  
  const renderNameConfirmationView = () => {
    if (!extractedName) return null;
    return (
        <>
           <div className="flex-1 space-y-4">
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
            <DialogFooter className="pt-6">
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleNameConfirmation}>Yes, this is correct. Proceed.</Button>
            </DialogFooter>
        </>
    );
  }

  const renderDataConfirmationView = () => {
    if (!extractedData) return null;
    const hasAnyData = extractedData.hba1cValue || extractedData.lipidPanel || extractedData.vitaminDValue || extractedData.thyroidPanel || extractedData.bloodPressure;
    const isDateValid = extractedData.date && isValid(parseISO(extractedData.date));

    const expectedLipidUnit = biomarkerUnit === 'conventional' ? 'mg/dL' : 'mmol/L';
    const lipidUnitMismatch = extractedData.lipidPanel?.units && extractedData.lipidPanel.units !== expectedLipidUnit;
    
    const expectedVitaminDUnit = biomarkerUnit === 'conventional' ? 'ng/mL' : 'nmol/L';
    const vitaminDUnitMismatch = extractedData.vitaminDUnits && extractedData.vitaminDUnits !== expectedVitaminDUnit;

    const canConfirm = hasAnyData && isDateValid && !lipidUnitMismatch && !vitaminDUnitMismatch;

    return (
        <>
            <ScrollArea className="flex-1 -mx-6">
                <div className="px-6 py-4 space-y-4">
                     <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                        <FileText className="h-5 w-5 text-primary" />
                         <div className="flex-1">
                            <p className="font-semibold">Report Date</p>
                            {isDateValid ? (
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(extractedData.date!)}
                                </p>
                            ) : (
                                 <div className="space-y-2">
                                    <p className="text-sm text-destructive">Date not found. Please select one.</p>
                                    <DatePicker 
                                        placeholder='Select a date'
                                        value={extractedData.date ? parseISO(extractedData.date) : undefined}
                                        onChange={(newDate) => {
                                            if (newDate) {
                                                setExtractedData({ ...extractedData, date: newDate.toISOString().split('T')[0] })
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                     </div>

                    <Separator />

                    <h4 className="font-medium text-center text-muted-foreground">Extracted Results</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {extractedData.hba1cValue && (
                             <div className="flex items-center gap-3 rounded-md border p-2">
                                <Droplet className="h-5 w-5 text-primary/80" />
                                <div>
                                    <p className="font-semibold">HbA1c</p>
                                    <p>{extractedData.hba1cValue}%</p>
                                </div>
                            </div>
                        )}
                        {extractedData.vitaminDValue && (
                            <div className="flex items-center gap-3 rounded-md border p-2">
                               <Sun className="h-5 w-5 text-primary/80" />
                               <div>
                                   <p className="font-semibold">Vitamin D</p>
                                   <p>{extractedData.vitaminDValue} {extractedData.vitaminDUnits}</p>
                               </div>
                                {vitaminDUnitMismatch && (
                                     <Tooltip>
                                        <TooltipTrigger>
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Unit mismatch. Expected {expectedVitaminDUnit}.</p>
                                        </TooltipContent>
                                     </Tooltip>
                                )}
                           </div>
                        )}
                         {extractedData.bloodPressure && (
                            <div className="flex items-center gap-3 rounded-md border p-2">
                               <Zap className="h-5 w-5 text-primary/80" />
                               <div>
                                   <p className="font-semibold">Blood Pressure</p>
                                   <p>{extractedData.bloodPressure.systolic}/{extractedData.bloodPressure.diastolic} mmHg</p>
                               </div>
                           </div>
                        )}
                    </div>

                    {extractedData.lipidPanel && (
                         <div className="rounded-md border p-2 space-y-2">
                            <div className="flex items-center gap-3">
                                 <FlaskConical className="h-5 w-5 text-primary/80" />
                                 <p className="font-semibold">Lipid Panel ({extractedData.lipidPanel.units || 'N/A'})</p>
                                  {lipidUnitMismatch && (
                                     <Tooltip>
                                        <TooltipTrigger>
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Unit mismatch. Expected {expectedLipidUnit}.</p>
                                        </TooltipContent>
                                     </Tooltip>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                                 <div className="rounded-md bg-muted/50 p-2">
                                    <p className="font-semibold">Total</p>
                                    <p>{extractedData.lipidPanel.total || 'N/A'}</p>
                                </div>
                                <div className="rounded-md bg-muted/50 p-2">
                                    <p className="font-semibold">LDL</p>
                                    <p>{extractedData.lipidPanel.ldl || 'N/A'}</p>
                                </div>
                                <div className="rounded-md bg-muted/50 p-2">
                                    <p className="font-semibold">HDL</p>
                                    <p>{extractedData.lipidPanel.hdl || 'N/A'}</p>
                                </div>
                                 <div className="rounded-md bg-muted/50 p-2">
                                    <p className="font-semibold">Trig.</p>
                                    <p>{extractedData.lipidPanel.triglycerides || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                     {extractedData.thyroidPanel && (
                         <div className="rounded-md border p-2 space-y-2">
                            <div className="flex items-center gap-3">
                                 <Activity className="h-5 w-5 text-primary/80" />
                                 <p className="font-semibold">Thyroid Panel</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                 <div className="rounded-md bg-muted/50 p-2">
                                    <p className="font-semibold">TSH (μIU/mL)</p>
                                    <p>{extractedData.thyroidPanel.tsh || 'N/A'}</p>
                                </div>
                                <div className="rounded-md bg-muted/50 p-2">
                                    <p className="font-semibold">T3 (ng/dL)</p>
                                    <p>{extractedData.thyroidPanel.t3 || 'N/A'}</p>
                                </div>
                                <div className="rounded-md bg-muted/50 p-2">
                                    <p className="font-semibold">T4 (μg/dL)</p>
                                    <p>{extractedData.thyroidPanel.t4 || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!hasAnyData && (
                        <p className="text-center text-muted-foreground text-sm py-4">No specific biomarker data could be extracted. Please check the document or enter manually.</p>
                    )}
                </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={handleDataConfirmation} disabled={!canConfirm}>
                    Confirm & Add Records
                </Button>
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
        case 'confirmingData':
            return renderDataConfirmationView();
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
          case 'confirmingData':
              return 'Please review the extracted information below and confirm to add it to your records.';
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
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
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
