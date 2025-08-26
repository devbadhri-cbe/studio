
'use client';

import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, Pencil, Trash2, User, VenetianMask, Mail, Phone, Droplet, Activity, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { calculateAge } from '@/lib/utils';
import { Separator } from './ui/separator';
import { countries } from '@/lib/countries';

interface PatientCardProps {
  patient: Patient;
  onView: (patient: Patient) => void;
  onEdit: () => void;
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

export function PatientCard({ patient, onView, onEdit, onDelete }: PatientCardProps) {
  const statusVariant = getStatusVariant(patient.status);
  const age = calculateAge(patient.dob);
  const country = countries.find(c => c.code === patient.country);
  const countryName = country?.name || patient.country;

  return (
    <Card className="w-full flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{patient.name}</CardTitle>
        <CardDescription>
            {age ? `${age} years old` : 'N/A'}, <span className="capitalize">{patient.gender}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2 text-muted-foreground">
             <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{patient.email || 'N/A'}</span>
            </div>
             <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span className='truncate'>{patient.phone || 'N/A'}</span>
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
                 <Activity className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium">Last LDL:</span>
                 <span className="truncate">
                    {patient.lastLipid 
                        ? `${patient.lastLipid.ldl} mg/dL on ${format(new Date(patient.lastLipid.date), 'dd-MM-yy')}`
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
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => onView(patient)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Details
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
