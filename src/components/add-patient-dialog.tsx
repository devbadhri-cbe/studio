
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { addPatient } from '@/lib/firestore';
import type { PatientFormData } from './patient-form';
import { PatientForm } from './patient-form';

interface AddPatientDialogProps {
    children: React.ReactNode;
    onPatientAdded: () => void;
}

export function AddPatientDialog({ children, onPatientAdded }: AddPatientDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    
    const patientData = {
        name: data.name,
        dob: data.dob.toISOString(),
        gender: data.gender,
        email: data.email || '',
        country: data.country,
        phone: data.phone || '',
        height: data.height ? Number(data.height) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
    }

    try {
        const newPatient = await addPatient(patientData);
        toast({
            title: 'Patient Added',
            description: `${newPatient.name} has been successfully added to your patient list.`,
        });
        onPatientAdded();
        setOpen(false);
    } catch (error) {
        console.error("Failed to add patient", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add the patient. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
          {children}
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient's details below to create a new record.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
                <div className="p-6">
                    <PatientForm 
                        onSubmit={onSubmit} 
                        isSubmitting={isSubmitting}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
