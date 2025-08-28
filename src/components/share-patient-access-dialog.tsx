
'use client';

import * as React from 'react';
import QRCode from 'react-qr-code';
import { Patient } from '@/lib/types';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Clipboard, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

interface SharePatientAccessDialogProps {
  patient: Patient;
  children: React.ReactNode;
}

export function SharePatientAccessDialog({ patient, children }: SharePatientAccessDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [dashboardLink, setDashboardLink] = React.useState('');
  const [loginPageLink, setLoginPageLink] = React.useState('');
  const [isShareSupported, setIsShareSupported] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open && typeof window !== 'undefined') {
       const host = window.location.host;
       const correctedHost = host.replace(/^6000-/, '9000-');
       const protocol = window.location.protocol;

       const directUrl = `${protocol}//${correctedHost}/patient/${patient.id}`;
       setDashboardLink(directUrl);

       const loginUrl = `${protocol}//${correctedHost}/patient/login`;
       setLoginPageLink(loginUrl);

       if (navigator.share) {
         setIsShareSupported(true);
       }
    }
  }, [open, patient.id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied`,
      description: `The ${label.toLowerCase()} has been copied to your clipboard.`,
    });
  };

  const handleShare = async () => {
    if (!navigator.share) return;

    try {
        await navigator.share({
            title: `Health Guardian Access for ${patient.name}`,
            text: `Here is the one-click access link to your Health Guardian dashboard.`,
            url: dashboardLink,
        });
    } catch (error) {
        console.error('Error sharing:', error);
        toast({
            variant: 'destructive',
            title: 'Sharing Failed',
            description: 'Could not open the share dialog. Please try copying the link instead.',
        });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Share Access for {patient.name}</DialogTitle>
          <DialogDescription>
            Share this unique QR code or link with the patient for direct, one-click access to their dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-center rounded-lg bg-white p-4">
            {dashboardLink ? <QRCode value={dashboardLink} size={160} /> : <div className="h-[160px] w-[160px] bg-gray-200 animate-pulse" />}
          </div>

          {isShareSupported && (
            <Button className="w-full" onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              Share Access Link
            </Button>
          )}

          <div className="space-y-2">
            <Label htmlFor="dashboard-link">Patient's Dashboard Link (Direct Access)</Label>
            <div className="flex gap-2">
              <Input id="dashboard-link" value={dashboardLink} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(dashboardLink, 'Dashboard Link')}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <p className="text-sm text-muted-foreground text-center">Or share these for manual login:</p>
          
          <div className="space-y-2">
            <Label htmlFor="login-page-link">Patient Login Page</Label>
            <div className="flex gap-2">
              <Input id="login-page-link" value={loginPageLink} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(loginPageLink, 'Login Page Link')}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>

           <div className="space-y-2">
            <Label htmlFor="patient-id">Patient ID</Label>
            <div className="flex gap-2">
              <Input id="patient-id" value={patient.id} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(patient.id, 'Patient ID')}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
