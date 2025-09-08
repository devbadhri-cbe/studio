
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
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';

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
  const [dashboardLink, setDashboardLink] = React.useState('');
  const [loginPageLink, setLoginPageLink] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setIsLoading(true);
      // Ensure this code runs only on the client
      let origin = window.location.origin;
      if (origin.includes('6000-')) {
          origin = origin.replace('6000-', '9000-');
      }
      setDashboardLink(`${origin}/patient/${patient.id}`);
      setLoginPageLink(`${origin}/`);
      setIsLoading(false);
    }
  }, [open, patient.id]);

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
  
  const handleShare = async () => {
    const shareData = {
      title: `Health Guardian Access for ${patient.name}`,
      text: `Hello ${patient.name},\n\nHere is the link to your personal health dashboard, shared by your doctor. You can use this link to securely view your health data.\n\nDashboard Link: ${dashboardLink}\n\nIf you need to log in manually, use this link and your Patient ID.\nLogin Page: ${loginPageLink}\nPatient ID: ${patient.id}\n\nBest,\nYour Doctor`,
      url: dashboardLink,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard(shareData.text, 'Access Details');
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Share Patient Access</DialogTitle>
              <DialogDescription>
                Provide the patient with their unique link or QR code.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border p-4">
            <h3 className="text-sm font-medium">Direct Access via QR Code</h3>
            <div className="rounded-lg bg-white p-3">
              {isLoading ? (
                <Skeleton className="h-32 w-32" />
              ) : (
                <QRCode value={dashboardLink} size={128} />
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Patient can scan this code with their phone camera to instantly
              access their dashboard.
            </p>
          </div>
          
           <div className="flex items-center justify-center">
             <Button onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Options
             </Button>
           </div>
          

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-2 text-sm text-muted-foreground">Or</span>
            </div>
          </div>


          <div className="space-y-4">
            <h3 className="text-sm font-medium text-center">Manual Entry Fallback</h3>
            <div className="space-y-2">
              <Label htmlFor="login-link">Login Page Link</Label>
              <div className="flex gap-2">
                <Input id="login-link" value={loginPageLink} readOnly />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(loginPageLink, 'Login Link')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="patient-id">Patient ID</Label>
              <div className="flex gap-2">
                <Input id="patient-id" value={patient.id} readOnly />
                 <Button variant="outline" size="icon" onClick={() => copyToClipboard(patient.id, 'Patient ID')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
