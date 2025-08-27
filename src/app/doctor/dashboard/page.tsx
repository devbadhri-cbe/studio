
'use client';

import * as React from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Eye, MoreHorizontal, UserPlus, Pencil, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockPatients } from '@/lib/mock-data';
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


type PatientFormData = Omit<Patient, 'id' | 'lastHba1c' | 'lastLipid' | 'status' | 'records' | 'lipidRecords' | 'medication' | 'presentMedicalConditions' | 'vitaminDRecords' | 'lastVitaminD' | 'thyroidRecords' | 'lastThyroid' | 'weightRecords' | 'lastBloodPressure' | 'bloodPressureRecords'>

export default function DoctorDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const doctorName = 'Dr. Badhrinathan N';
    const [patients, setPatients] = React.useState<Patient[]>([]);
    const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');


    React.useEffect(() => {
        try {
            const storedPatients = localStorage.getItem('doctor-patients');
            if (storedPatients) {
                setPatients(JSON.parse(storedPatients));
            } else {
                setPatients(mockPatients);
                localStorage.setItem('doctor-patients', JSON.stringify(mockPatients));
            }
        } catch (error) {
            console.error("Failed to parse patients from localStorage", error);
            setPatients(mockPatients);
        }
    }, []);

    const savePatients = (updatedPatients: Patient[]) => {
        const sortedPatients = updatedPatients.sort((a, b) => {
            // Simple sort by name for now, can be made more complex
            return a.name.localeCompare(b.name);
        });
        setPatients(sortedPatients);
        localStorage.setItem('doctor-patients', JSON.stringify(sortedPatients));
    }

    const viewPatientDashboard = (patient: Patient) => {
        router.push(`/patient/${patient.id}`);
    }

    const handleSavePatient = (patientData: PatientFormData, patientId?: string) => {
        if (patientId) { // Editing existing patient
            const updatedPatients = patients.map(p => 
                p.id === patientId ? { ...p, ...patientData } : p
            );
            savePatients(updatedPatients);
        } else { // Adding new patient
            const newPatient: Patient = {
                ...patientData,
                id: Date.now().toString(),
                lastHba1c: null,
                lastLipid: null,
                lastVitaminD: null,
                lastThyroid: null,
                lastBloodPressure: null,
                status: 'On Track',
                records: [],
                lipidRecords: [],
                vitaminDRecords: [],
                thyroidRecords: [],
                weightRecords: [],
                bloodPressureRecords: [],
                medication: [],
                presentMedicalConditions: [],
            };
            const updatedPatients = [newPatient, ...patients];
            savePatients(updatedPatients);
        }
    };
    
    const removePatient = (patientId: string) => {
        const updatedPatients = patients.filter(p => p.id !== patientId);
        savePatients(updatedPatients);
        setPatientToDelete(null);
        toast({
            title: 'Patient Deleted',
            description: 'The patient has been removed from the list.'
        });
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
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-semibold text-lg text-foreground">{doctorName}</p>
            <div className="flex items-center justify-center gap-4">
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
                <Button onClick={() => router.push('/patient/dashboard')} variant="outline" size="sm" className="hidden sm:inline-flex">My Patient Dashboard</Button>
            </div>


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
                        <PatientFormDialog onSave={handleSavePatient}>
                            <Button size="sm" className="gap-1 w-full sm:w-auto">
                                <UserPlus className="h-3.5 w-3.5" />
                                <span className="whitespace-nowrap">Add Patient</span>
                            </Button>
                        </PatientFormDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
