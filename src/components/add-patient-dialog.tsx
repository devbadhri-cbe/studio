
'use client';

import * as React from 'react';
import type { Patient } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PatientForm } from './patient-form';

interface PatientFormDialogProps {
    patient?: Patient;
    onSave: (patient: Partial<Patient> & { weight?: number | string }, patientId?: string) => void;
    children: React.ReactNode | ((props: { openDialog: () => void }) => React.ReactNode);
}

export function PatientFormDialog({ patient, onSave, children }: PatientFormDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSave = async (patientData: Partial<Patient> & { weight?: number | string }, patientId?: string) => {
    await onSave(patientData, patientId);
    setOpen(false);
  };
  
  const openDialog = () => setOpen(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {typeof children === 'function' ? (
        children({ openDialog })
      ) : (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="w-full max-w-lg max-h-[90vh] flex flex-col p-0 sm:p-0">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b">
          <DialogTitle>{patient ? 'Edit Patient Details' : 'Add New Patient'}</DialogTitle>
          <DialogDescription>
            Fill out the form below to {patient ? 'update their details' : 'add them to your list'}.
          </DialogDescription>
        </DialogHeader>
        <PatientForm
            patient={patient}
            onSave={handleSave}
            onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

    