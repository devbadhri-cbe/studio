

'use client';

import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Eye, Pencil, Trash2, Mail, Phone, Sun, Zap, Globe, Clock, Bell, Share2, Droplet } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { calculateAge, formatDisplayPhoneNumber } from '@/lib/utils';
import { countries } from '@/lib/countries';
import * as React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import { SharePatientAccessDialog } from './share-patient-access-dialog';

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
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  const statusVariant = getStatusVariant(patient.status);
  const age = calculateAge(patient.dob);
  const country = countries.find(c => c.code === patient.country);
  const countryName = country?.name || patient.country;
  const formattedPhone = formatDisplayPhoneNumber(patient.phone, patient.country);
  const nameRef = React.useRef<HTMLHeadingElement>(null);
  const [isNameOverflowing, setIsNameOverflowing] = React.useState(false);

  const needsReview = patient.presentMedicalConditions?.some(c => c.status === 'pending_review');

  React.useEffect(() => {
    if (nameRef.current) {
        setIsNameOverflowing(nameRef.current.scrollWidth > nameRef.current.clientWidth);
    }
  }, [patient.name]);

  const handleDropdownSelect = (e: Event, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  }
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <>
    <Card 
        className="relative w-full flex flex-col transition-all group md:hover:border-primary/50 shadow-md md:hover:shadow-lg"
    >
      <div 
        role="button"
        onClick={() => onView(patient)}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                onView(patient);
            }
        }}
        tabIndex={0}
        className="w-full h-full flex flex-col p-0 text-left bg-transparent border-0 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
      >
        <CardHeader className="p-4 w-full">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 flex items-center gap-3 min-w-0">
                    <Avatar>
                        <AvatarFallback>
                            {getInitials(patient.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <CardTitle 
                                ref={nameRef}
                                className={cn("text-lg whitespace-nowrap overflow-hidden", isNameOverflowing && "pr-4")} 
                                style={isNameOverflowing ? {
                                    maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                                } : {}}
                            >{patient.name}</CardTitle>
                            {needsReview && (
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
                <div className="shrink-0">
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
                             <DropdownMenuItem onSelect={(e) => handleDropdownSelect(e, () => setIsShareOpen(true))}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Access
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
            </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 space-y-3 text-sm flex-1">
            <div className="space-y-1.5 text-muted-foreground text-xs p-2 border rounded-md">
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

            <div className="grid grid-cols-2 gap-2 text-center text-xs p-1 border rounded-md">
                <div className="flex flex-col items-center justify-center p-1 rounded-md bg-muted/50">
                    <Droplet className="h-4 w-4 mb-1 text-primary" />
                    <span className="font-semibold">{patient.lastFastingBloodGlucose ? patient.lastFastingBloodGlucose.value.toFixed(0) : 'N/A'}</span>
                    <span className="text-muted-foreground text-[10px]">Glucose</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 rounded-md bg-muted/50">
                    <Zap className="h-4 w-4 mb-1 text-primary" />
                    <span className="font-semibold">{patient.lastBloodPressure ? `${patient.lastBloodPressure.systolic}/${patient.lastBloodPressure.diastolic}` : 'N/A'}</span>
                    <span className="text-muted-foreground text-[10px]">BP</span>
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
      </div>
    </Card>
    {patient && <SharePatientAccessDialog open={isShareOpen} onOpenChange={setIsShareOpen} patient={patient} />}
    </>
  );
}
