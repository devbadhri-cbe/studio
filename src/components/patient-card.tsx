
'use client';

import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Eye, Pencil, Trash2, Mail, Phone, Sun, Zap, Globe, User, Share2, MessageSquare, Clock, Info, Bell, Droplet } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { calculateAge, formatDisplayPhoneNumber } from '@/lib/utils';
import { Separator } from './ui/separator';
import { countries } from '@/lib/countries';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from './ui/avatar';
import { SharePatientAccessDialog } from './share-patient-access-dialog';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useApp } from '@/context/app-context';

// A simple SVG for WhatsApp icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.31 20.6C8.75 21.38 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.04 20.13C10.56 20.13 9.12 19.74 7.85 19L7.54 18.82L4.44 19.6L5.25 16.58L4.93 16.27C4.14 14.9 3.79 13.41 3.79 11.91C3.79 7.36 7.5 3.65 12.04 3.65C14.28 3.65 16.32 4.5 17.84 5.99C19.33 7.48 20.2 9.49 20.2 11.91C20.2 16.46 16.59 20.13 12.04 20.13M16.56 14.45C16.31 14.17 15.42 13.72 15.19 13.63C14.96 13.54 14.8 13.5 14.64 13.78C14.48 14.06 14.04 14.64 13.86 14.83C13.69 15.02 13.53 15.04 13.25 14.95C12.97 14.86 12.03 14.54 10.93 13.57C10.06 12.82 9.53 11.91 9.39 11.63C9.25 11.35 9.37 11.23 9.49 11.11C9.6 11 9.73 10.85 9.87 10.68C10 10.5 10.04 10.37 10.13 10.18C10.22 9.99 10.18 9.85 10.1 9.76C10.02 9.67 9.61 8.65 9.44 8.23C9.28 7.81 9.11 7.85 8.95 7.85H8.58C8.42 7.85 8.13 7.92 7.89 8.16C7.65 8.4 7.07 8.93 7.07 10.05C7.07 11.17 7.92 12.23 8.05 12.37C8.18 12.51 9.9 15.12 12.44 16.1C13.11 16.38 13.62 16.52 13.98 16.63C14.59 16.78 15.12 16.74 15.53 16.35C16.01 15.91 16.42 15.22 16.63 14.87C16.84 14.52 16.81 14.33 16.77 14.23C16.73 14.14 16.64 14.06 16.56 14.02" />
    </svg>
);

interface PatientCardProps {
  patient: Patient;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

const getStatusVariant = (status: Patient['status']) => {
    switch (status) {
        case 'Urgent':
            return 'destructive';
        case 'Needs Review':
            return 'secondary';
        case 'On Track':
            return 'outline';
        default:
            return 'default';
    }
}

const statusDescriptions: Record<Patient['status'], string> = {
    'Urgent': 'Set when BP ≥ 140/90 or other critical values are met.',
    'Needs Review': 'Set when key biomarkers are abnormal, or when a patient-added condition requires verification.',
    'On Track': 'Set when all key biomarkers are within their target ranges.'
};


export function PatientCard({ patient, onView, onEdit, onDelete }: PatientCardProps) {
  const { toast } = useToast();
  const { isDoctorLoggedIn } = useApp();
  const statusVariant = getStatusVariant(patient.status);
  const age = calculateAge(patient.dob);
  const country = countries.find(c => c.code === patient.country);
  const countryName = country?.name || patient.country;
  const formattedPhone = formatDisplayPhoneNumber(patient.phone, patient.country);

  const needsReview = patient.presentMedicalConditions?.some(c => c.status === 'pending_review') || patient.dashboardSuggestions?.some(s => s.status === 'pending');
  
  const handleContact = (method: 'whatsapp' | 'sms' | 'email') => {
    const doctorName = patient.doctorName || "your doctor";
    switch (method) {
        case 'whatsapp':
            if (!patient.phone) {
                 toast({ variant: 'destructive', title: 'No Phone Number Found' });
                 return;
            }
            window.open(`https://wa.me/${patient.phone.replace(/\D/g, '')}`, '_blank');
            break;
        case 'sms':
             if (!patient.phone) {
                 toast({ variant: 'destructive', title: 'No Phone Number Found' });
                 return;
            }
            window.location.href = `sms:${patient.phone.replace(/\s/g, '')}`;
            break;
        case 'email':
             if (!patient.email) {
                 toast({ variant: 'destructive', title: 'No Email Found' });
                 return;
            }
            const subject = `Message from your doctor`;
            const body = `Hello ${patient.name},\n\nThis is a message from ${doctorName} regarding your health status. Please get in touch.\n\nBest,\n${doctorName}`;
            window.location.href = `mailto:${patient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            break;
    }
  }

  const handleDropdownSelect = (e: Event, callback: () => void) => {
    e.preventDefault();
    callback();
  }

  return (
    <Card 
        className="relative w-full flex flex-col transition-all group md:hover:border-primary/50 shadow-md md:hover:shadow-lg"
    >
      <button 
        onClick={() => onView(patient)}
        className="w-full h-full flex flex-col p-0 text-left bg-transparent border-0 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
      >
        <CardHeader className="p-4 w-full">
            <div className="flex items-start justify-between">
            <div className="flex-1 flex items-center gap-3 min-w-0">
                <Avatar>
                    <AvatarFallback>
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg truncate">{patient.name}</CardTitle>
                        {isDoctorLoggedIn && needsReview && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative">
                                        <Bell className="h-4 w-4 text-destructive" />
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Needs doctor's review</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                        {age ? `${age} years` : 'N/A'}, <span className="capitalize">{patient.gender}</span>
                    </p>
                </div>
            </div>
            {/* The dropdown menu is outside the button flow */}
            </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 space-y-3 text-sm flex-1">
            <div className="space-y-1.5 text-muted-foreground text-xs">
                <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                        Last seen: {patient.lastLogin ? formatDistanceToNow(new Date(patient.lastLogin), { addSuffix: true }) : 'Never'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="truncate">{formattedPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{patient.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 shrink-0" />
                    <span className="truncate">{countryName}</span>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="flex flex-col items-center justify-center p-1 rounded-md bg-muted/50">
                    <Droplet className="h-4 w-4 mb-1 text-primary" />
                    <span className="font-semibold">{patient.fastingBloodGlucoseRecords && patient.fastingBloodGlucoseRecords.length > 0 ? `${[...patient.fastingBloodGlucoseRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value}` : 'N/A'}</span>
                    <span className="text-muted-foreground text-[10px]">Glucose</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 rounded-md bg-muted/50">
                    <Zap className="h-4 w-4 mb-1 text-primary" />
                    <span className="font-semibold">{patient.lastBloodPressure ? `${patient.lastBloodPressure.systolic}/${patient.lastBloodPressure.diastolic}` : 'N/A'}</span>
                    <span className="text-muted-foreground text-[10px]">BP</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 rounded-md bg-muted/50">
                    <Sun className="h-4 w-4 mb-1 text-primary" />
                    <span className="font-semibold">{patient.lastVitaminD ? `${patient.lastVitaminD.value}` : 'N/A'}</span>
                    <span className="text-muted-foreground text-[10px]">Vit D</span>
                </div>
            </div>
        </CardContent>

        <div className="p-4 pt-0 mt-auto">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant={statusVariant} className={`w-full justify-center cursor-help ${statusVariant === 'outline' ? 'border-green-500 text-green-600' : ''}`}>
                        {patient.status}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent align="center" side="bottom" className="max-w-[250px] text-xs">
                    <div className="font-bold text-base mb-1">{patient.status}</div>
                    <div className="text-left">
                        <p>{statusDescriptions[patient.status]}</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </div>
      </button>

      {/* Dropdown positioned absolutely to not interfere with the button */}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={(e) => handleDropdownSelect(e, () => onView(patient))}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => handleDropdownSelect(e, () => onEdit(patient))}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Patient
                </DropdownMenuItem>
                <SharePatientAccessDialog patient={patient}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Patient Access
                    </DropdownMenuItem>
                </SharePatientAccessDialog>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Contact Patient</DropdownMenuLabel>
                <DropdownMenuItem onSelect={(e) => handleDropdownSelect(e, () => handleContact('whatsapp'))} disabled={!patient.phone}>
                    <WhatsAppIcon className="mr-2 h-4 w-4" />
                    WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => handleDropdownSelect(e, () => handleContact('sms'))} disabled={!patient.phone}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    SMS / iMessage
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => handleDropdownSelect(e, () => handleContact('email'))} disabled={!patient.email}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onSelect={(e) => handleDropdownSelect(e, () => onDelete(patient))}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Patient
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
