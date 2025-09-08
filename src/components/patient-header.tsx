

'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { UploadRecordDialog } from './upload-record-dialog';
import { Button } from './ui/button';
import { Edit, Info, MessageSquare, Mail } from 'lucide-react';
import { EditDoctorDetailsDialog } from './edit-doctor-details-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';


// A simple SVG for WhatsApp icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.31 20.6C8.75 21.38 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.04 20.13C10.56 20.13 9.12 19.74 7.85 19L7.54 18.82L4.44 19.6L5.25 16.58L4.93 16.27C4.14 14.9 3.79 13.41 3.79 11.91C3.79 7.36 7.5 3.65 12.04 3.65C14.28 3.65 16.32 4.5 17.84 5.99C19.33 7.48 20.2 9.49 20.2 11.91C20.2 16.46 16.59 20.13 12.04 20.13M16.56 14.45C16.31 14.17 15.42 13.72 15.19 13.63C14.96 13.54 14.8 13.5 14.64 13.78C14.48 14.06 14.04 14.64 13.86 14.83C13.69 15.02 13.53 15.04 13.25 14.95C12.97 14.86 12.03 14.54 10.93 13.57C10.06 12.82 9.53 11.91 9.39 11.63C9.25 11.35 9.37 11.23 9.49 11.11C9.6 11 9.73 10.85 9.87 10.68C10 10.5 10.04 10.37 10.13 10.18C10.22 9.99 10.18 9.85 10.1 9.76C10.02 9.67 9.61 8.65 9.44 8.23C9.28 7.81 9.11 7.85 8.95 7.85H8.58C8.42 7.85 8.13 7.92 7.89 8.16C7.65 8.4 7.07 8.93 7.07 10.05C7.07 11.17 7.92 12.23 8.05 12.37C8.18 12.51 9.9 15.12 12.44 16.1C13.11 16.38 13.62 16.52 13.98 16.63C14.59 16.78 15.12 16.74 15.53 16.35C16.01 15.91 16.42 15.22 16.63 14.87C16.84 14.52 16.81 14.33 16.77 14.23C16.73 14.14 16.64 14.06 16.56 14.02" />
    </svg>
);


interface PatientHeaderProps {
    children?: React.ReactNode;
}

export function PatientHeader({ children }: PatientHeaderProps) {
  const { profile, isDoctorLoggedIn, setProfile } = useApp();
  const [isEditing, setIsEditing] = React.useState(false);
  const { toast } = useToast();
  
  const pageTitle = isDoctorLoggedIn
    ? `${profile.name}'s Dashboard`
    : `Welcome, ${profile.name || 'User'}!`;
  
  const handleChat = (method: 'whatsapp' | 'sms' | 'email') => {
    if (!profile.doctorPhone && (method === 'whatsapp' || method === 'sms')) {
        toast({variant: 'destructive', title: 'No Doctor Phone Number', description: 'Please add your doctor\'s phone number first.'});
        return;
    }
     if (!profile.doctorEmail && method === 'email') {
        toast({variant: 'destructive', title: 'No Doctor Email', description: 'Please add your doctor\'s email address first.'});
        return;
    }

    const loginPageLink = `${window.location.origin}/patient/${profile.id}?viewer=doctor`;
    const message = `Hello Dr. ${profile.doctorName || ''}, please use this link to access my Health Guardian dashboard: ${loginPageLink}`;

    switch(method) {
        case 'whatsapp':
             window.open(`https://wa.me/${profile.doctorPhone!.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
             break;
        case 'sms':
            window.location.href = `sms:${profile.doctorPhone!.replace(/\s/g, '')}?&body=${encodeURIComponent(message)}`;
            break;
        case 'email':
             window.location.href = `mailto:${profile.doctorEmail}?subject=${encodeURIComponent("Health Guardian Dashboard")}&body=${encodeURIComponent(message)}`;
             break;
    }
  };

  return (
    <>
    <div className="flex flex-col md:flex-row items-center gap-4 border-2 border-red-500">
      <div className="text-center md:text-left border-2 border-green-500">
        <h1 className="text-2xl md:text-3xl font-semibold font-headline">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground mt-2">
            Your health overview. Consult your doctor before making any decisions.
        </p>
      </div>
      <div className="w-full md:w-auto flex flex-1 items-center justify-end gap-4 border-2 border-blue-500">
        <div className="flex-1 flex items-center gap-2 text-sm text-muted-foreground border-2 border-purple-500 md:justify-center">
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                <span>Consulting with:</span>
                <span className="font-semibold text-foreground">{profile.doctorName || 'Not Set'}</span>
            </div>
            
            {!isDoctorLoggedIn && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                </Button>
            )}

            {!isDoctorLoggedIn && profile.doctorName && !profile.doctorUid && (
                <>
                <Tooltip>
                    <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Your doctor has not logged in yet. <br /> Use the chat button to invite them.</p>
                    </TooltipContent>
                </Tooltip>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MessageSquare className="h-4 w-4 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleChat('whatsapp')}>
                        <WhatsAppIcon className="mr-2 h-4 w-4" />
                        <span>WhatsApp</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => handleChat('sms')}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>SMS / iMessage</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => handleChat('email')}>
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Email</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </>
            )}
        </div>
        <div className="flex border-2 border-orange-500">
            <UploadRecordDialog />
        </div>
      </div>
    </div>
    <EditDoctorDetailsDialog open={isEditing} onOpenChange={setIsEditing} />
    </>
  );
}
