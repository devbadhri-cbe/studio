
'use client';

import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, Pencil, Trash2, User, VenetianMask, Mail, Phone, Droplet, Activity, Globe, Sun, TrendingUp, Zap, Clipboard } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { calculateAge } from '@/lib/utils';
import { Separator } from './ui/separator';
import { countries } from '@/lib/countries';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';


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
    // Don't navigate if the user is clicking on a button or the dropdown menu
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


  return (
    <Card className="w-full flex flex-col cursor-pointer hover:border-primary/50 transition-colors" onClick={handleCardClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="truncate">{patient.name}</CardTitle>
            <CardDescription className="truncate text-xs">
                {age ? `${age} years old` : 'N/A'}, <span className="capitalize">{patient.gender}</span>
                 {patient.bmi && <span className="font-semibold"> (BMI: {patient.bmi})</span>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2 text-muted-foreground">
            <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="truncate">{formattedPhone}</span>
            </div>
             <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{patient.email || 'N/A'}</span>
            </div>
             <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="truncate">{countryName}</span>
            </div>
        </div>

        <Separator />

        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium">Last HbA1c:</span>
                <span className="truncate">
                    {patient.lastHba1c 
                        ? `${patient.lastHba1c.value.toFixed(1)}% on ${format(new Date(patient.lastHba1c.date), 'dd-MM-yy')}` 
                        : 'N/A'}
                </span>
            </div>
            <div className="flex items-center gap-2">
                 <Zap className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium">Last BP:</span>
                 <span className="truncate">
                    {patient.lastBloodPressure 
                        ? `${patient.lastBloodPressure.systolic}/${patient.lastBloodPressure.diastolic} on ${format(new Date(patient.lastBloodPressure.date), 'dd-MM-yy')}`
                        : 'N/A'}
                </span>
            </div>
             <div className="flex items-center gap-2">
                 <Sun className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium">Last Vit D:</span>
                 <span className="truncate">
                    {patient.lastVitaminD 
                        ? `${patient.lastVitaminD.value} ng/mL on ${format(new Date(patient.lastVitaminD.date), 'dd-MM-yy')}`
                        : 'N/A'}
                </span>
            </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between bg-muted/50 p-4">
        <Badge variant={statusVariant} className={statusVariant === 'outline' ? 'border-green-500 text-green-600' : ''}>
            {patient.status}
        </Badge>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 p-0" onClick={handleActionClick}>
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
      </CardFooter>
    </Card>
  );
}
