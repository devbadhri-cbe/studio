
'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface UploadRecordDialogProps {
  children?: React.ReactNode;
}

export function UploadRecordDialog({ children }: UploadRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    toast({
        variant: 'destructive',
        title: 'Feature Disabled',
        description: 'AI-powered document uploads are temporarily disabled.',
    });
    setOpen(false);
  };
  
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
             This feature is temporarily disabled.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 p-6">
            <Alert>
                <AlertTitle>Feature Currently Unavailable</AlertTitle>
                <AlertDescription>
                We are working on improving the AI-powered document upload feature. Please use the manual entry buttons on the relevant biomarker cards to add your data for now.
                </AlertDescription>
            </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
