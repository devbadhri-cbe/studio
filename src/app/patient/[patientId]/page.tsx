
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useParams, useRouter } from 'next/navigation';
import PatientDashboard from '@/app/patient/dashboard/page';
import { getPatient } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function PatientDashboardPage() {
    const { setPatientData, isDoctorLoggedIn } = useApp();
    const router = useRouter();
    const { toast } = useToast();
    const params = useParams();
    const patientId = params.patientId as string;
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!patientId) return;

        const verifyAccessAndLoadData = async () => {
            const loggedInPatientId = localStorage.getItem('patient_id');
            const isDoctor = isDoctorLoggedIn || localStorage.getItem('doctor_logged_in') === 'true';

            // If a doctor is logged in, they can access any patient dashboard
            if (isDoctor) {
                try {
                    const patient = await getPatient(patientId);
                    if (patient) {
                        setPatientData(patient);
                    } else {
                        setError(`Patient with ID ${patientId} not found.`);
                    }
                } catch (e) {
                    console.error("Failed to load patient data:", e);
                    setError('Failed to load patient data.');
                } finally {
                    setIsLoading(false);
                }
                return;
            }
            
            // If it's a patient, check if they are already logged in via localStorage
            if (loggedInPatientId === patientId) {
                 try {
                    const patient = await getPatient(patientId);
                    if (patient) {
                        setPatientData(patient);
                    } else {
                        setError(`Patient with ID ${patientId} not found.`);
                        localStorage.removeItem('patient_id'); // Clean up invalid ID
                    }
                } catch (e) {
                    console.error("Failed to load patient data:", e);
                    setError('Failed to load patient data.');
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            // If not logged in as a doctor or the correct patient,
            // treat this as a direct link access attempt.
            // We'll fetch the patient data to verify the ID is valid,
            // then set it in localStorage to "log them in".
            try {
                const patient = await getPatient(patientId);
                if (patient) {
                    localStorage.setItem('patient_id', patient.id);
                    setPatientData(patient);
                } else {
                    setError(`No patient found for this link. Please check the ID and try again.`);
                    router.replace('/'); // Redirect to patient login if ID is invalid
                }
            } catch (e) {
                console.error("Direct link access failed:", e);
                setError('An error occurred while trying to load the dashboard.');
                 router.replace('/');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAccessAndLoadData();

    }, [patientId, setPatientData, router, toast, isDoctorLoggedIn]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="ml-4">Loading patient dashboard...</p>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="flex h-screen flex-col items-center justify-center bg-background text-destructive text-center p-4">
                <p>{error}</p>
                <Button onClick={() => router.push('/')} className="mt-4">Go to Login</Button>
            </div>
        );
    }
    
    return <PatientDashboard />;
}
