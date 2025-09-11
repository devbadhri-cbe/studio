
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
import { Copy, Share2, Mail } from 'lucide-react';
import * as React from 'react';
import QRCode from 'react-qr-code';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from './ui/separator';
import { useApp } from '@/context/app-context';


const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.31 20.6C8.75 21.38 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.04 20.13C10.56 20.13 9.12 19.74 7.85 19L7.54 18.82L4.44 19.6L5.25 16.58L4.93 16.27C4.14 14.9 3.79 13.41 3.79 11.91C3.79 7.36 7.5 3.65 12.04 3.65C14.28 3.65 16.32 4.5 17.84 5.99C19.33 7.48 20.2 9.49 20.2 11.91C20.2 16.46 16.59 20.13 12.04 20.13M16.56 14.45C16.31 14.17 15.42 13.72 15.19 13.63C14.96 13.54 14.8 13.5 14.64 13.78C14.48 14.06 14.04 14.64 13.86 14.83C13.69 15.02 13.53 15.04 13.25 14.95C12.97 14.86 12.03 14.54 10.93 13.57C10.06 12.82 9.53 11.91 9.39 11.63C9.25 11.35 9.37 11.23 9.49 11.11C9.6 11 9.73 10.85 9.87 10.68C10 10.5 10.04 10.37 10.13 10.18C10.22 9.99 10.18 9.85 10.1 9.76C10.02 9.67 9.61 8.65 9.44 8.23C9.28 7.81 9.11 7.85 8.95 7.85H8.58C8.42 7.85 8.13 7.92 7.89 8.16C7.65 8.4 7.07 8.93 7.07 10.05C7.07 11.17 7.92 12.23 8.05 12.37C8.18 12.51 9.9 15.12 12.44 16.1C13.11 16.38 13.62 16.52 13.98 16.63C14.59 16.78 15.12 16.74 15.53 16.35C16.01 15.91 16.42 15.22 16.63 14.87C16.84 14.52 16.81 14.33 16.77 14.23C16.73 14.14 16.64 14.06 16.56 14.02" />
    </svg>
);


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

  const getShareText = (includeTitle: boolean = true) => {
    const title = `Hello ${patient.name},\n\nHere is the link to your Health Guardian dashboard:\n`;
    return `${includeTitle ? title : ''}${shareLink}`;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({ title: `${label} Copied!`, description: 'The link is ready to be pasted.' });
      },
      (err) => {
        toast({
          variant: 'destructive',
          title: 'Copy Failed',
          description: `Could not copy the ${label.toLowerCase()}.`,
        });
        console.error('Could not copy text: ', err);
      }
    );
  };
  
  const handleContact = (method: 'whatsapp' | 'email') => {
    const body = getShareText();
    switch (method) {
        case 'whatsapp':
            if (!patient.phone) {
                 toast({ variant: 'destructive', title: 'No Phone Number Found' });
                 return;
            }
            window.open(`https://wa.me/${patient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(body)}`, '_blank');
            break;
        case 'email':
             if (!patient.email) {
                 toast({ variant: 'destructive', title: 'No Email Found' });
                 return;
            }
            const subject = `Your Health Guardian Dashboard`;
            window.location.href = `mailto:${patient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            break;
    }
  }

  const DialogContentComponent = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Share2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <DialogTitle>Share Patient Access</DialogTitle>
            <DialogDescription>
              Share a secure, read-only link to this dashboard.
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
            The patient can scan this with their phone to view their dashboard.
          </p>
        </div>

        <div className="space-y-4">
            <div>
                 <h3 className="text-sm font-medium mb-2">Send Link via...</h3>
                 <div className="space-y-2">
                    <Button variant="outline" className="w-full" onClick={() => handleContact('whatsapp')} disabled={isLoading}>
                        <WhatsAppIcon className="mr-2 h-4 w-4" />
                        WhatsApp
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleContact('email')} disabled={isLoading}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </Button>
                 </div>
            </div>

            <Separator />
            
            <div>
                 <h3 className="text-sm font-medium mb-2">Copy Link</h3>
                 <div className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="share-link">Dashboard Link</Label>
                        <div className="flex gap-2">
                        <Input id="share-link" value={shareLink} readOnly />
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(shareLink, 'Link')} disabled={isLoading}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        </div>
                    </div>
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
      <DialogContent className="sm:max-w-2xl">
        <DialogContentComponent />
      </DialogContent>
    </Dialog>
  );
}
