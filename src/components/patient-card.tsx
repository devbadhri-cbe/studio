
'use client';

import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{patient.name}</CardTitle>
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
                    View
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onSelect={() => onDelete(patient)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Badge variant={statusVariant} className={statusVariant === 'outline' ? 'border-green-500 text-green-600' : ''}>
                {patient.status}
            </Badge>
            <div className="text-right">
                <p>{patient.email}</p>
                <p>{patient.phone}</p>
            </div>
        </div>
        <div className="mt-4 border-t pt-4">
            <div className="flex justify-between">
                <div className="text-sm">
                    <p className="text-muted-foreground">Last HbA1c</p>
                    <p className="font-medium">
                        {patient.lastHba1c 
                            ? `${patient.lastHba1c.value.toFixed(1)}% on ${format(new Date(patient.lastHba1c.date), 'dd-MM-yyyy')}` 
                            : 'N/A'}
                    </p>
                </div>
                <div className="text-sm text-right">
                    <p className="text-muted-foreground">Last LDL</p>
                    <p className="font-medium">
                        {patient.lastLipid 
                            ? `${patient.lastLipid.ldl} mg/dL on ${format(new Date(patient.lastLipid.date), 'dd-MM-yyyy')}`
                            : 'N/A'}
                    </p>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
