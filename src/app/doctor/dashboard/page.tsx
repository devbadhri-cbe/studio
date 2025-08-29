
'use client';

import * as React from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Mail, Search, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Patient } from '@/lib/types';
import { PatientFormDialog } from '@/components/add-patient-dialog';
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
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { PatientCard } from '@/components/patient-card';
import { addPatient, deletePatient, getPatients, updatePatient } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientForm } from '@/components/patient-form';

export default function DoctorDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const doctorName = 'Dr. Badhrinathan N';
    const [patients, setPatients] = React.useState<Patient[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isAddingPatient, setIsAddingPatient] = React.useState(false);

    const fetchPatients = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedPatients = await getPatients();
            setPatients(fetchedPatients);
        } catch (error) {
            console.error("Failed to fetch patients from Firestore", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load patient data from the cloud."
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const viewPatientDashboard = (patient: Patient) => {
        router.push(`/patient/${patient.id}`);
    }

    const handleSavePatient = async (patientData: Partial<Patient> & { weight?: number | string }, patientId?: string) => {
        try {
            if (patientId) { // Editing existing patient
                const updatedPatient = await updatePatient(patientId, patientData);
                setPatients(patients.map(p => p.id === patientId ? updatedPatient : p));
                 toast({
                    title: 'Patient Updated',
                    description: `${updatedPatient.name}'s details have been updated.`,
                });
            } else { // Adding new patient
                const newPatient = await addPatient(patientData as Omit<Patient, 'id' | 'records' | 'lipidRecords' | 'vitaminDRecords' | 'thyroidRecords' | 'bloodPressureRecords' | 'weightRecords' | 'lastHba1c' | 'lastLipid' | 'lastVitaminD' | 'lastThyroid' | 'lastBloodPressure' | 'status' | 'medication' | 'presentMedicalConditions' | 'bmi'> & { weight?: number });
                toast({
                    title: 'Patient Added',
                    description: `${newPatient.name}'s details have been added.`,
                });
                setIsAddingPatient(false);
                await fetchPatients();
            }
        } catch (error) {
             console.error("Failed to save patient:", error);
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not save patient details. Please try again.',
             });
        }
    };
    
    const removePatient = async (patientId: string) => {
        try {
            await deletePatient(patientId);
            setPatients(patients.filter(p => p.id !== patientId));
            setPatientToDelete(null);
            toast({
                title: 'Patient Deleted',
                description: 'The patient has been removed from the list.'
            });
        } catch (error) {
             console.error("Failed to delete patient:", error);
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete patient. Please try again.',
             });
        }
    }
    
    const filteredPatients = patients.filter(patient => {
        const query = searchQuery.toLowerCase();
        return (
            patient.name.toLowerCase().includes(query) ||
            (patient.email && patient.email.toLowerCase().includes(query)) ||
            (patient.phone && patient.phone.toLowerCase().includes(query))
        );
    });

  return (
    <>
    <div className="flex min-h-screen w-full flex-col bg-background">
       <header className="border-b px-4 py-4 md:px-6 flex flex-col items-center gap-2">
          <div className="w-full flex justify-start md:justify-center">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
            </div>
          </div>
          <div className="w-full text-left md:text-center text-sm text-muted-foreground">
            <p className="font-semibold text-lg text-foreground">{doctorName}</p>
            <div className="flex items-center justify-start md:justify-center gap-4">
              <a href="mailto:drbadhri@gmail.com" className="flex items-center gap-1.5 hover:text-primary">
                <Mail className="h-3 w-3" />
                drbadhri@gmail.com
              </a>
            </div>
          </div>
        </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto w-full max-w-7xl">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold font-headline">
                        Patient Overview
                    </h1>
                    <p className="text-muted-foreground">Manage and review your patients' health data.</p>
                </div>
            </div>

            {isAddingPatient && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Add New Patient</CardTitle>
                        <CardDescription>Fill out the form below to add a new patient to your list.</CardDescription>
                    </CardHeader>
                    <PatientForm
                        onSave={handleSavePatient}
                        onCancel={() => setIsAddingPatient(false)}
                    />
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="grid gap-2 flex-1">
                        <CardTitle>Patient List</CardTitle>
                        <CardDescription>A list of all patients currently under your care.</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                         <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name, email, or phone..."
                                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button size="sm" className="gap-1 w-full sm:w-auto" onClick={() => setIsAddingPatient(true)} disabled={isAddingPatient}>
                            <UserPlus className="h-3.5 w-3.5" />
                            <span className="whitespace-nowrap">Add Patient</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[300px] w-full" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredPatients.map((patient) => (
                                 <PatientFormDialog key={patient.id} patient={patient} onSave={handleSavePatient}>
                                    {({ openDialog }) => (
                                        <PatientCard
                                            patient={patient}
                                            onView={viewPatientDashboard}
                                            onEdit={openDialog}
                                            onDelete={setPatientToDelete}
                                        />
                                    )}
                                 </PatientFormDialog>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>

    <AlertDialog open={!!patientToDelete} onOpenChange={() => setPatientToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the patient record for <span className="font-semibold">{patientToDelete?.name}</span> and remove all associated data.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={() => patientToDelete && removePatient(patientToDelete.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    Continue
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    
