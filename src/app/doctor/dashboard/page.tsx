
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getAllPatients, deletePatient as deletePatientFromDB, addPatient } from '@/lib/firestore';
import type { Patient } from '@/lib/types';
import { PatientCard } from '@/components/patient-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
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
import { TitleBar } from '@/components/ui/title-bar';
import { doctorDetails } from '@/lib/doctor-data';
import { EditDoctorDetailsDialog } from '@/components/edit-doctor-details-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function DoctorDashboardPage() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);
  const [isEditingDoctor, setIsEditingDoctor] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const isMobile = useIsMobile();

  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPatients = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const allPatients = await getAllPatients();
      
      const statusPriority: { [key in Patient['status']]: number } = {
        'Urgent': 1,
        'Needs Review': 2,
        'On Track': 3,
      };

      const sortedPatients = allPatients.sort((a, b) => {
        const priorityA = statusPriority[a.status] || 4;
        const priorityB = statusPriority[b.status] || 4;
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        const aDate = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const bDate = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        if (aDate !== bDate) {
          return bDate - aDate;
        }
        
        return a.name.localeCompare(b.name);
      });

      setPatients(sortedPatients);
    } catch (error) {
      console.error("Failed to fetch patients", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load patient data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleViewPatient = (patient: Patient) => {
    router.push(`/patient/${patient.id}?view=doctor`);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;

    const patientIdToDelete = patientToDelete.id;
    const patientName = patientToDelete.name;

    // Optimistically update UI
    setPatients(currentPatients => currentPatients.filter(p => p.id !== patientIdToDelete));
    setPatientToDelete(null);

    try {
      await deletePatientFromDB(patientIdToDelete);
      toast({
        title: 'Patient Deleted',
        description: `${patientName}'s profile has been deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete patient", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Could not delete ${patientName}'s profile. Refreshing list.`,
      });
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

  const renderPatientForm = (isEditing: boolean) => {
    const props = {
      patient: isEditing ? editingPatient! : undefined,
      onSubmit: isEditing ? handleEditFormSubmit : handleFormSubmit,
      isSubmitting: isSubmitting,
      onCancel: () => isEditing ? setEditingPatient(null) : setIsCreating(false),
    };
    
    const title = isEditing ? "Edit Patient Profile" : "Create New Patient Profile";
    const description = isEditing ? "Update the patient's details." : "Enter the patient's details to create their health dashboard.";

    if (isMobile) {
      return (
        <Sheet open={isEditing ? !!editingPatient : isCreating} onOpenChange={isEditing ? (open) => !open && setEditingPatient(null) : setIsCreating}>
            <SheetContent side="bottom" className="h-[90vh] p-0">
                 <SheetHeader className="p-6">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                <div className="p-6 overflow-y-auto h-[calc(90vh-100px)]">
                    <PatientForm {...props} />
                </div>
            </SheetContent>
        </Sheet>
      )
    }

    return (
        <Dialog open={isEditing ? !!editingPatient : isCreating} onOpenChange={isEditing ? (open) => !open && setEditingPatient(null) : setIsCreating}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <PatientForm {...props} />
            </DialogContent>
        </Dialog>
    )
  }
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Loading patients...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <TitleBar
          title={['Health', 'Guardian']}
          subtitle={doctorDetails.name}
          onSubtitleClick={() => setIsEditingDoctor(true)}
          isScrolled={isScrolled}
        />
        <main className="flex-1 p-4 md:p-6">
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

              {/* Dialogs / Sheets */}
              {renderPatientForm(false)}
              {renderPatientForm(true)}

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
        </main>
      </div>
      <EditDoctorDetailsDialog open={isEditingDoctor} onOpenChange={setIsEditingDoctor} />
    </>
  );
}
