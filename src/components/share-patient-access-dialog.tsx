
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
       const host = window.location.host;
       const correctedHost = host.replace(/^6000-/, '9000-');
       const url = `https://${correctedHost}/patient/${patient.id}`;
       setLoginLink(url);
    }
  }, [open, patient.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `Link Copied`,
      description: `The patient dashboard link has been copied.`,
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
            Share this unique QR code or link with the patient for direct, one-click access to their dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center rounded-lg bg-white p-4">
            {loginLink ? <QRCode value={loginLink} size={160} /> : <div className="h-[160px] w-[160px] bg-gray-200 animate-pulse" />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-link">Patient's Dashboard Link</Label>
            <div className="flex gap-2">
              <Input id="login-link" value={loginLink} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(loginLink)}
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
