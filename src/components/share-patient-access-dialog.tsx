
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
import { Clipboard, QrCode } from 'lucide-react';
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
    if (typeof window !== 'undefined') {
      setLoginLink(`${window.location.origin}/patient/${patient.id}`);
    }
  }, [patient.id]);

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
            Share this link, ID, or QR code with the patient to give them access to their dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center rounded-lg bg-white p-4">
            {loginLink && <QRCode value={loginLink} size={160} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-link">Login Link</Label>
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
