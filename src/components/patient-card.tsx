
'use client';

import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, Pencil, Trash2, Mail, Phone, Droplet, Sun, Zap, Clipboard, Globe, Link, User } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { calculateAge } from '@/lib/utils';
import { Separator } from './ui/separator';
import { countries } from '@/lib/countries';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


interface PatientCardProps {
  patient: Patient;
  onView: (patient: Patient) => void;
  onEdit: () => void;
  onDelete: (patient: Patient) => void;
}

const formatPhoneNumber = (phone: string, countryCode: string): string => {
    const country = countries.find(c => c.code === countryCode);
    if (!phone || !country) return phone || 'N/A';

    let phoneDigits = phone.replace(country.phoneCode, '').replace(/\D/g, '');
    
    if (phone.startsWith(country.phoneCode)) {
      phoneDigits = phone.substring(country.phoneCode.length).replace(/\D/g, '');
    } else {
      phoneDigits = phone.replace(/\D/g, '');
    }


    switch (countryCode) {
        case 'US':
            if (phoneDigits.length === 10) {
                return `(${phoneDigits.substring(0, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6)}`;
            }
            break;
        case 'IN':
             if (phoneDigits.length === 10) {
                return `+91 ${phoneDigits.substring(0, 5)} ${phoneDigits.substring(5)}`;
            }
            break;
        default:
            return `${country.phoneCode} ${phoneDigits}`;
    }
    
    return `${country.phoneCode} ${phoneDigits}`;
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


export function PatientCard({ patient, onView, onEdit, onDelete }: PatientCardProps) {
  const { toast } = useToast();
  const statusVariant = getStatusVariant(patient.status);
  const age = calculateAge(patient.dob);
  const country = countries.find(c => c.code === patient.country);
  const countryName = country?.name || patient.country;
  const formattedPhone = formatPhoneNumber(patient.phone, patient.country);
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, [role="menu"]')) {
      return;
    }
    onView(patient);
  };
  
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(patient.id);
    toast({
      title: 'Patient ID Copied',
      description: `ID "${patient.id}" has been copied to your clipboard.`,
    });
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/patient/${patient.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Patient Link Copied',
      description: 'The login link has been copied to your clipboard.',
    });
  };


  return (
    <Card className="w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors group" onClick={handleCardClick}>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 flex items-center gap-3">
             <Avatar>
                <AvatarImage src={patient.photoUrl} />
                <AvatarFallback>
                    <User className="h-5 w-5" />
                </AvatarFallback>
             </Avatar>
             <div>
                <CardTitle className="text-lg">{patient.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                    {age ? `${age} years old` : 'N/A'}, <span className="capitalize">{patient.gender}</span>
                    {patient.bmi && <span className="font-semibold"> (BMI: {patient.bmi.toFixed(1)})</span>}
                </p>
             </div>
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleActionClick}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={handleActionClick}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => onView(patient)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Details
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={handleCopyLink}>
                    <Link className="mr-2 h-4 w-4" />
                    Copy Login Link
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleCopyId}>
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copy Patient ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onSelect={() => onDelete(patient)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Patient
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3 text-sm flex-1">
        <div className="space-y-1.5 text-muted-foreground text-xs">
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
                <span className="font-semibold">{patient.lastHba1c ? `${patient.lastHba1c.value.toFixed(1)}%` : 'N/A'}</span>
                <span className="text-muted-foreground text-[10px]">HbA1c</span>
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

      <div className="p-4 pt-0">
        <Badge variant={statusVariant} className={`w-full justify-center ${statusVariant === 'outline' ? 'border-green-500 text-green-600' : ''}`}>
            {patient.status}
        </Badge>
      </div>
    </Card>
  );
}
