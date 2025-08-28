
'use client';

import * as React from 'react';
import type { Patient } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PatientFormDialogProps {
    patient?: Patient;
    onSave: (patient: Partial<Patient> & { weight?: number }, patientId?: string) => void;
    children: React.ReactNode | ((props: { openDialog: () => void }) => React.ReactNode);
}

export function PatientFormDialog({ patient, onSave, children }: PatientFormDialogProps) {
  const [open, setOpen] = React.useState(false);

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{patient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
        </DialogHeader>
        {/* The dialog content will be built here based on your instructions. */}
      </DialogContent>
    </Dialog>
  );
}
