
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Patient } from '@/lib/types';
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
import { addPatient, deletePatient, getPatients } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientForm, type PatientFormData } from '@/components/patient-form';
import { TitleBar } from '@/components/title-bar';

export default function DoctorDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const doctorName = 'Dr. Badhrinathan N';
    const doctorEmail = 'drbadhri@gmail.com';
    const [patients, setPatients] = React.useState<Patient[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isAddingPatient, setIsAddingPatient] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);


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
    
    // Re-fetch data when the page is focused
    React.useEffect(() => {
        const handleFocus = () => {
            if (!isAddingPatient) {
                fetchPatients();
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchPatients, isAddingPatient]);


    const viewPatientDashboard = (patient: Patient) => {
        router.push(`/patient/${patient.id}`);
    }
    
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

    const handleAddPatientSubmit = async (data: PatientFormData) => {
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
                description: `${newPatient.name} has been successfully added.`,
            });
            await fetchPatients(); // Refetch all patients
            setIsAddingPatient(false);
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
       <TitleBar doctorName={doctorName} doctorEmail={doctorEmail} />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto w-full max-w-7xl">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div className={`flex-1 ${isAddingPatient ? 'text-center' : ''}`}>
                    <h1 className="text-2xl md:text-3xl font-semibold font-headline">
                        {isAddingPatient ? 'Add New Patient' : 'Patient Overview'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isAddingPatient ? "Enter the patient's details below." : "Manage and review your patients' health data."}
                    </p>
                </div>
                 <Button onClick={() => setIsAddingPatient(p => !p)}>
                    {isAddingPatient ? <X className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    {isAddingPatient ? 'Cancel' : 'Add Patient'}
                </Button>
            </div>

            {isAddingPatient ? (
                <Card className="max-w-[800px] mx-auto">
                    <CardContent className="p-6">
                         <PatientForm 
                            onSubmit={handleAddPatientSubmit} 
                            isSubmitting={isSubmitting}
                            onCancel={() => setIsAddingPatient(false)}
                        />
                    </CardContent>
                </Card>
            ) : (
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
                                    <PatientCard
                                        key={patient.id}
                                        patient={patient}
                                        onView={viewPatientDashboard}
                                        onDelete={setPatientToDelete}
                                    />
                                ))}
                            </div>
                        )}
                         {(!isLoading && filteredPatients.length === 0) && (
                            <div className="text-center text-muted-foreground py-12">
                                <p>No patients found.</p>
                                {searchQuery && <p className="text-sm">Try adjusting your search query.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

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
