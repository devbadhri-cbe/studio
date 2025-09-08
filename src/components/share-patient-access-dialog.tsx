
'use client';

import * as React from 'react';
import QRCode from 'react-qr-code';
import type { Patient } from '@/lib/types';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Mail, Share2, Copy, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';

interface SharePatientAccessDialogProps {
  patient: Patient;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SharePatientAccessDialog({ patient, children, open, onOpenChange }: SharePatientAccessDialogProps) {
  const [dashboardLink, setDashboardLink] = React.useState('');
  const [loginPageLink, setLoginPageLink] = React.useState('');
  const qrRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open && typeof window !== 'undefined') {
       const origin = window.location.origin;
       setDashboardLink(`${origin}/patient/${patient.id}?viewer=doctor`);
       setLoginPageLink(`${origin}/doctor/login`);
    }
  }, [open, patient.id]);

  const copyToClipboard = (text: string, subject: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${subject} Copied`,
      description: `The ${subject.toLowerCase()} has been copied to your clipboard.`,
    });
  };
  
  const downloadQrCode = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = document.createElement('img');
    img.onload = () => {
        canvas.width = 256;
        canvas.height = 256;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `health-guardian-qrcode-${patient.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }

  const shareActions = [
    {
        label: 'Copy Dashboard Link',
        icon: <Copy className="mr-2 h-4 w-4" />,
        action: () => copyToClipboard(dashboardLink, 'Dashboard Link')
    },
    {
        label: 'Download QR Code Image',
        icon: <ImageIcon className="mr-2 h-4 w-4" />,
        action: downloadQrCode,
    },
    {
        label: 'Open in New Tab',
        icon: <ExternalLink className="mr-2 h-4 w-4" />,
        action: () => window.open(dashboardLink, '_blank')
    },
    {
        label: 'Send via Email',
        icon: <Mail className="mr-2 h-4 w-4" />,
        action: () => {
            if (!patient.doctorEmail) {
                toast({ variant: 'destructive', title: 'No Doctor Email Found', description: 'Please add your doctor\'s email address first.' });
                return;
            }
            const subject = `Your Health Guardian Dashboard Access`;
            const body = `Hello Dr. ${patient.doctorName || ''},\n\nYou can access my Health Guardian dashboard via this link:\n\n${dashboardLink}\n\nBest,\n${patient.name}`;
            window.location.href = `mailto:${patient.doctorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Share Access for {patient.name}</DialogTitle>
          <DialogDescription>
            Use the QR code or share the unique link for direct dashboard access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-center rounded-lg bg-white p-4">
            <div ref={qrRef}>
                {dashboardLink ? <QRCode value={dashboardLink} size={160} /> : <Skeleton className="h-[160px] w-[160px]" />}
            </div>
          </div>

          <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Options
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {shareActions.map((item) => (
                    <DropdownMenuItem key={item.label} onSelect={item.action}>
                        {item.icon}
                        <span>{item.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
           </DropdownMenu>
          </div>

            <Separator />

            <div className="space-y-3 text-center">
                 <h4 className="text-sm font-medium text-muted-foreground">Manual Entry Fallback</h4>
                <div className="space-y-2 text-left">
                    <label className="text-xs font-medium text-muted-foreground">Login Page Link</label>
                    <div className="flex items-center gap-2">
                        <Input value={loginPageLink} readOnly className="h-8 text-xs" />
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(loginPageLink, "Login Link")}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2 text-left">
                    <label className="text-xs font-medium text-muted-foreground">Patient ID</label>
                    <div className="flex items-center gap-2">
                        <Input value={patient.id} readOnly className="h-8 text-xs" />
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(patient.id, "Patient ID")}>
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
