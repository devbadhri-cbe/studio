
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
import { Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharePatientAccessDialogProps {
  patient: Patient;
  children: React.ReactNode;
}

export function SharePatientAccessDialog({ patient, children }: SharePatientAccessDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [loginLink, setLoginLink] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    if (open && typeof window !== 'undefined') {
      // The browser is incorrectly reporting port 6000. We will forcefully replace it
      // with the correct port 9000 for the dev environment.
      const rawUrl = `${window.location.protocol}//${window.location.host}/`;
      const correctedUrl = rawUrl.replace(':6000', ':9000');
      setLoginLink(correctedUrl);
    }
  }, [open]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied`,
      description: `${label} has been copied to your clipboard.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Share Access for {patient.name}</DialogTitle>
          <DialogDescription>
            Share the QR code or login link with the patient. They will need to enter their Patient ID to log in.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center rounded-lg bg-white p-4">
            {loginLink ? <QRCode value={loginLink} size={160} /> : <div className="h-[160px] w-[160px] bg-gray-200 animate-pulse" />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-link">Login Page Link</Label>
            <div className="flex gap-2">
              <Input id="login-link" value={loginLink} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(loginLink, 'Login Link')}
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
