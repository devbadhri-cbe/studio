
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { deletePatient as deletePatientFromDB, addPatient, getAllPatients } from '@/lib/firestore';
import type { Patient } from '@/lib/types';
import { PatientCard } from '@/components/patient-card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PatientForm, type PatientFormData } from '@/components/patient-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PatientListClientProps {
    initialPatients: Patient[];
}

export function PatientListClient({ initialPatients }: PatientListClientProps) {
  const [patients, setPatients] = React.useState<Patient[]>(initialPatients);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const fetchPatients = React.useCallback(async () => {
     // This function can be used to re-fetch if needed, e.g., after an edit.
    const allPatients = await getAllPatients();
     // The sorting logic is duplicated from the server component to ensure consistency on refresh.
    const statusPriority: { [key in Patient['status']]: number } = { 'Urgent': 1, 'Needs Review': 2, 'On Track': 3 };
    const patientNeedsReview = (p: Patient) => p.presentMedicalConditions?.some(c => c.status === 'pending_review') || p.dashboardSuggestions?.some(s => s.status === 'pending');
    
    const sorted = allPatients.sort((a, b) => {
        const aNeedsReview = patientNeedsReview(a);
        const bNeedsReview = patientNeedsReview(b);
        if (aNeedsReview && !bNeedsReview) return -1;
        if (!aNeedsReview && bNeedsReview) return 1;
        const aDate = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const bDate = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        if (aDate !== bDate) return bDate - aDate;
        const priorityA = statusPriority[a.status] || 4;
        const priorityB = statusPriority[b.status] || 4;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.name.localeCompare(b.name);
    });
    setPatients(sorted);
  }, []);

  const handleViewPatient = (patient: Patient) => {
    router.push(`/patient/${patient.id}`);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;

    const patientName = patientToDelete.name;
    setPatients(currentPatients => currentPatients.filter(p => p.id !== patientToDelete.id));
    setPatientToDelete(null);

    try {
      await deletePatientFromDB(patientToDelete.id);
      toast({
        title: 'Patient Deleted',
        description: `${patientName}'s profile has been deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete patient", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the patient profile. The list will be refreshed.',
      });
      fetchPatients(); // Re-fetch on error
    }
  };

  const handleFormSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    const patientData = {
      name: data.name,
      dob: data.dob.toISOString(),
      gender: data.gender,
      email: data.email || '',
      country: data.country,
      phone: data.phone || '',
    };

    try {
      const newPatient = await addPatient(patientData);
      toast({
        title: 'Patient Created',
        description: `${newPatient.name}'s profile has been created successfully.`,
      });
      setIsCreating(false);
      fetchPatients();
    } catch (error) {
      console.error("Failed to save patient", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the patient profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFormSubmit = async (data: PatientFormData) => {
    if (!editingPatient) return;
    setIsSubmitting(true);
    // This is a placeholder for update logic.
    setTimeout(() => {
      toast({
        title: 'Patient Updated',
        description: `${data.name}'s profile has been updated.`,
      });
      setEditingPatient(null);
      fetchPatients();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patient List</h1>
        <Button onClick={() => setIsCreating(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>
      {patients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onView={handleViewPatient}
              onEdit={handleEditPatient}
              onDelete={() => setPatientToDelete(patient)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <h2 className="text-xl font-semibold">No patients found.</h2>
          <p className="mt-2">Click "Add New Patient" to get started.</p>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Patient Profile</DialogTitle>
            <DialogDescription>Enter the patient's details to create their health dashboard.</DialogDescription>
          </DialogHeader>
          <PatientForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} onCancel={() => setIsCreating(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPatient} onOpenChange={(open) => !open && setEditingPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient Profile</DialogTitle>
            <DialogDescription>Update the patient's details.</DialogDescription>
          </DialogHeader>
          <PatientForm patient={editingPatient!} onSubmit={handleEditFormSubmit} isSubmitting={isSubmitting} onCancel={() => setEditingPatient(null)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient's profile and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
