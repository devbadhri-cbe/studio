
'use client';

import { labResultUpload } from '@/ai/flows/lab-result-upload';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function UploadRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const { addRecord, profile } = useApp();
  const { toast } = useToast();

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

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const photoDataUri = reader.result as string;
      try {
        const result = await labResultUpload({ photoDataUri, name: profile.name });
        
        if (!result.nameVerified) {
          toast({
            variant: 'destructive',
            title: 'Name Verification Failed',
            description: 'The name on the lab report does not match your profile name.',
          });
          setIsUploading(false);
          return;
        }

        const hba1cValue = parseFloat(result.hba1cResult.replace('%', ''));
        if (isNaN(hba1cValue)) {
            throw new Error('Invalid HbA1c value extracted.');
        }

        addRecord({
          value: hba1cValue,
          date: new Date(result.date).toISOString(),
        });

        toast({
          title: 'Upload Successful!',
          description: `Successfully extracted HbA1c value of ${result.hba1cResult} from ${result.date}.`,
        });

        setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <UploadCloud className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Result</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Lab Result</DialogTitle>
          <DialogDescription>Let AI read your lab result document. We'll extract the HbA1c value, date, and verify your name from an image or PDF.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Analyzing your document...</p>
              <p className="text-xs">This may take a moment.</p>
            </div>
          ) : (
            <>
              <Alert>
                <AlertTitle>Important!</AlertTitle>
                <AlertDescription>
                  For best results, use a clear, uncropped image or a text-based PDF of your lab report. Ensure your name, the test date, and HbA1c value are visible.
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
