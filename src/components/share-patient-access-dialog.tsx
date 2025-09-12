'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/lib/types';
import { Copy, Share2 } from 'lucide-react';
import * as React from 'react';
import QRCode from 'react-qr-code';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useApp } from '@/context/app-context';


interface SharePatientAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
}

export function SharePatientAccessDialog({
  open,
  onOpenChange,
  patient,
}: SharePatientAccessDialogProps) {
  const { toast } = useToast();
  const [shareLink, setShareLink] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const isMobile = useIsMobile();
  const { getFullPatientData } = useApp();

  React.useEffect(() => {
    if (open) {
      setIsLoading(true);
      try {
        const origin = window.location.origin;
        const fullPatientData = getFullPatientData();
        const encodedData = btoa(JSON.stringify(fullPatientData));
        setShareLink(`${origin}/patient/${patient.id}?data=${encodedData}`);
      } catch (error) {
          console.error("Failed to create share link:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not create a shareable link.' });
      } finally {
        setIsLoading(false);
      }
    }
  }, [open, patient.id, getFullPatientData, toast]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(
      () => {
        toast({ title: 'Link Copied!', description: 'The link is ready to be pasted.' });
      },
      (err) => {
        toast({
          variant: 'destructive',
          title: 'Copy Failed',
          description: 'Could not copy the link.',
        });
        console.error('Could not copy text: ', err);
      }
    );
  };

  const DialogContentComponent = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Share2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <DialogTitle>Share or Sync Data</DialogTitle>
            <DialogDescription>
              Scan the QR code or copy the link to transfer your data to another device.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border p-4">
          <h3 className="text-sm font-medium">Scan QR Code</h3>
          <div className="rounded-lg bg-white p-3">
            {isLoading ? (
              <Skeleton className="h-32 w-32" />
            ) : (
              <QRCode value={shareLink} size={128} />
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Scan this with another device to sync your data.
          </p>
        </div>

        <div className="flex flex-col justify-center space-y-4">
          <div>
            <Label htmlFor="share-link">Sync Link</Label>
            <div className="flex gap-2">
              <Input id="share-link" value={shareLink} readOnly />
              <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={isLoading}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="p-0">
                <div className="p-6 overflow-y-auto h-full">
                    <DialogContentComponent />
                </div>
            </SheetContent>
        </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogContentComponent />
      </DialogContent>
    </Dialog>
  );
}
