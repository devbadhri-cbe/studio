
'use client';

import { labResultUpload, type LabResultUploadOutput } from '@/ai/flows/lab-result-upload';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, CheckCircle, XCircle, FileText, FlaskConical, Sun, Droplet, Activity, Zap } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';


export function UploadRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [extractedData, setExtractedData] = React.useState<LabResultUploadOutput | null>(null);
  const { addBatchRecords, profile } = useApp();
  const { toast } = useToast();

  React.useEffect(() => {
    // Reset state when dialog is closed
    if (!open) {
      setIsUploading(false);
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
        description: 'Please set your name in the profile before uploading a lab result for verification.',
      });
      setOpen(false);
      return;
    }

    setIsUploading(true);
    setExtractedData(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const photoDataUri = reader.result as string;
      try {
        const result = await labResultUpload({ photoDataUri, name: profile.name });
        setExtractedData(result);

      } catch (error) {
        console.error('Error processing lab result:', error);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'Could not extract information from the lab result. Please try again or enter it manually.',
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'There was an issue reading your file.',
      });
      setIsUploading(false);
    };
  };

  const handleConfirm = () => {
    if (!extractedData) return;

    const { hba1cValue, lipidPanel, vitaminDValue, thyroidPanel, bloodPressure, date } = extractedData;
    
    addBatchRecords({
      hba1c: hba1cValue ? { value: hba1cValue, date } : undefined,
      lipid: lipidPanel ? { ...lipidPanel, date } : undefined,
      vitaminD: vitaminDValue ? { value: vitaminDValue, date } : undefined,
      thyroid: thyroidPanel ? { ...thyroidPanel, date } : undefined,
      bloodPressure: bloodPressure ? { ...bloodPressure, date } : undefined,
    });
    
    toast({
      title: 'Records Added!',
      description: 'Your health records have been updated successfully.',
    });
    setOpen(false);
  };

  const renderInitialView = () => (
    <>
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
    </>
  );

  const renderUploadingView = () => (
     <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Analyzing your document...</p>
        <p className="text-xs">This may take a moment.</p>
    </div>
  );

  const renderConfirmationView = () => {
    if (!extractedData) return null;
    const hasAnyData = extractedData.hba1cValue || extractedData.lipidPanel || extractedData.vitaminDValue || extractedData.thyroidPanel || extractedData.bloodPressure;
    
    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="max-h-[60vh] pr-6 -mr-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                        {extractedData.nameVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <div>
                            <p className="font-semibold">Name Verification</p>
                            <p className="text-sm text-muted-foreground">
                                {extractedData.nameVerified
                                    ? `Name "${profile.name}" successfully matched.`
                                    : `Name on document does not match "${profile.name}".`
                                }
                            </p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                        <FileText className="h-5 w-5 text-primary" />
                         <div>
                            <p className="font-semibold">Report Date</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(extractedData.date), 'MMMM d, yyyy')}
                            </p>
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
                                   <p>{extractedData.vitaminDValue} ng/mL</p>
                               </div>
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
                                 <p className="font-semibold">Lipid Panel (mg/dL)</p>
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
                <Button onClick={handleConfirm} disabled={!extractedData.nameVerified || !hasAnyData}>
                    Confirm & Add Records
                </Button>
            </DialogFooter>
        </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Lab Result</DialogTitle>
          <DialogDescription>
             {extractedData 
                ? 'Please review the extracted information below and confirm to add it to your records.'
                : 'Let AI read your lab result. It will extract HbA1c, Lipids, Vitamin D, and Thyroid values.'
             }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex-1 min-h-0">
          {isUploading ? renderUploadingView() : extractedData ? renderConfirmationView() : renderInitialView()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

    
