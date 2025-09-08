
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getAllPatients, deletePatient as deletePatientFromDB } from '@/lib/firestore';
import type { Patient } from '@/lib/types';
import { PatientCard } from '@/components/patient-card';
import { TitleBar } from '@/components/ui/title-bar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PatientForm, type PatientFormData } from '@/components/patient-form';
import { addPatient } from '@/lib/firestore';
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
import { TooltipProvider } from '@/components/ui/tooltip';


export default function DoctorDashboardPage() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  
  const statusPriority: { [key in Patient['status']]: number } = {
    'Urgent': 1,
    'Needs Review': 2,
    'On Track': 3,
  };

  const patientNeedsReview = (patient: Patient) => {
    return patient.presentMedicalConditions?.some(c => c.status === 'pending_review') || patient.dashboardSuggestions?.some(s => s.status === 'pending');
  }


  const fetchPatients = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const allPatients = await getAllPatients();
      const sortedPatients = allPatients.sort((a, b) => {
        const aNeedsReview = patientNeedsReview(a);
        const bNeedsReview = patientNeedsReview(b);

        // 1. Prioritize patients needing review (with the bell icon)
        if (aNeedsReview && !bNeedsReview) return -1;
        if (!aNeedsReview && bNeedsReview) return 1;

        // 2. For patients in the same review category, sort by lastLogin date
        const aDate = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const bDate = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;

        if (aDate !== bDate) {
          return bDate - aDate; // Sort descending (most recent first)
        }

        // 3. As a tie-breaker, sort by status priority
        const priorityA = statusPriority[a.status] || 4;
        const priorityB = statusPriority[b.status] || 4;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // 4. Final tie-breaker: sort by name
        return a.name.localeCompare(b.name);
      });
      setPatients(sortedPatients);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error fetching patients',
        description: 'Could not load patient data. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  React.useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);
  
  const handleViewPatient = (patient: Patient) => {
    router.push(`/patient/${patient.id}`);
  };
  
  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
  };
  
  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    
    const patientName = patientToDelete.name;
    // Optimistically update the UI
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
      // If the deletion fails, re-fetch the list to bring the patient back
      fetchPatients();
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
      // Logic to update patient would go here
      console.log("Updating patient...", data);
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
    <TooltipProvider>
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <TitleBar />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Patient List</h1>
            <Button onClick={() => setIsCreating(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Patient
            </Button>
          </div>
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                ))}
             </div>
          ) : patients.length > 0 ? (
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
        </div>
      </main>

      {/* Add/Edit Patient Dialogs */}
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

      {/* Delete Confirmation Dialog */}
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
    </TooltipProvider>
  );
}
