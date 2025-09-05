
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
import { Clipboard, Mail, MessageSquare, ExternalLink, Share2, Copy, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

// A simple SVG for WhatsApp icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.31 20.6C8.75 21.38 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.04 20.13C10.56 20.13 9.12 19.74 7.85 19L7.54 18.82L4.44 19.6L5.25 16.58L4.93 16.27C4.14 14.9 3.79 13.41 3.79 11.91C3.79 7.36 7.5 3.65 12.04 3.65C14.28 3.65 16.32 4.5 17.84 5.99C19.33 7.48 20.2 9.49 20.2 11.91C20.2 16.46 16.59 20.13 12.04 20.13M16.56 14.45C16.31 14.17 15.42 13.72 15.19 13.63C14.96 13.54 14.8 13.5 14.64 13.78C14.48 14.06 14.04 14.64 13.86 14.83C13.69 15.02 13.53 15.04 13.25 14.95C12.97 14.86 12.03 14.54 10.93 13.57C10.06 12.82 9.53 11.91 9.39 11.63C9.25 11.35 9.37 11.23 9.49 11.11C9.6 11 9.73 10.85 9.87 10.68C10 10.5 10.04 10.37 10.13 10.18C10.22 9.99 10.18 9.85 10.1 9.76C10.02 9.67 9.61 8.65 9.44 8.23C9.28 7.81 9.11 7.85 8.95 7.85H8.58C8.42 7.85 8.13 7.92 7.89 8.16C7.65 8.4 7.07 8.93 7.07 10.05C7.07 11.17 7.92 12.23 8.05 12.37C8.18 12.51 9.9 15.12 12.44 16.1C13.11 16.38 13.62 16.52 13.98 16.63C14.59 16.78 15.12 16.74 15.53 16.35C16.01 15.91 16.42 15.22 16.63 14.87C16.84 14.52 16.81 14.33 16.77 14.23C16.73 14.14 16.64 14.06 16.56 14.02" />
    </svg>
);


interface SharePatientAccessDialogProps {
  patient: Patient;
  children: React.ReactNode;
}

export function SharePatientAccessDialog({ patient, children }: SharePatientAccessDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [dashboardLink, setDashboardLink] = React.useState('');
  const [loginPageLink, setLoginPageLink] = React.useState('');
  const qrRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open && typeof window !== 'undefined') {
       const hostname = window.location.hostname;
       const protocol = window.location.protocol;
       const port = '3000';
       const host = `${hostname}:${port}`;
       setDashboardLink(`${protocol}//${host}/patient/${patient.id}`);
       setLoginPageLink(`${protocol}//${host}/`);
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
        icon: <Clipboard className="mr-2 h-4 w-4" />,
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
            if (!patient.email) {
                toast({ variant: 'destructive', title: 'No Email Found', description: 'This patient does not have an email address on file.' });
                return;
            }
            const subject = `Your Health Guardian Dashboard Access`;
            const body = `Hello ${patient.name},\n\nYou can access your Health Guardian dashboard via this link:\n\n${dashboardLink}\n\nAlternatively, you can scan the QR code (if attached) or use your Patient ID on the main login page.\n\nBest,\n${patient.doctorName || 'Your Doctor'}`;
            window.location.href = `mailto:${patient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    },
    {
        label: 'Send via Messages',
        icon: <MessageSquare className="mr-2 h-4 w-4" />,
        action: () => {
             if (!patient.phone) {
                toast({ variant: 'destructive', title: 'No Phone Number Found', description: 'This patient does not have a phone number on file.' });
                return;
            }
            const body = `Hello ${patient.name}, here is the link to your Health Guardian dashboard: ${dashboardLink}`;
            window.location.href = `sms:${patient.phone.replace(/\s/g, '')}?&body=${encodeURIComponent(body)}`;
        }
    },
     {
        label: 'Send via WhatsApp',
        icon: <WhatsAppIcon className="mr-2 h-4 w-4" />,
        action: () => {
            if (!patient.phone) {
                toast({ variant: 'destructive', title: 'No Phone Number Found', description: 'This patient does not have a phone number on file.' });
                return;
            }
            const body = `Hello ${patient.name}, here is the link to your Health Guardian dashboard: ${dashboardLink}`;
            window.open(`https://wa.me/${patient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(body)}`, '_blank');
        }
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                {dashboardLink ? <QRCode value={dashboardLink} size={160} /> : <div className="h-[160px] w-[160px] bg-gray-200 animate-pulse" />}
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

            <div className="space-y-3">
                 <h4 className="text-sm font-medium text-center text-muted-foreground">Manual Entry Fallback</h4>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Login Page Link</label>
                    <div className="flex items-center gap-2">
                        <Input value={loginPageLink} readOnly className="h-8 text-xs" />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(loginPageLink, "Login Link")}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Patient ID</label>
                    <div className="flex items-center gap-2">
                        <Input value={patient.id} readOnly className="h-8 text-xs" />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(patient.id, "Patient ID")}>
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

    