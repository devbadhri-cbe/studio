
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useParams, useRouter } from 'next/navigation';
import PatientDashboard from '@/app/patient/dashboard/page';
import { getPatient } from '@/lib/firestore';
import { Button } from '@/components/ui/button';

export default function PatientDashboardPage() {
    const { setPatientData, isDoctorLoggedIn, isClient } = useApp();
    const router = useRouter();
    const params = useParams();
    const patientId = params.patientId as string;
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!patientId || !isClient) return;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            // Flow for a logged-in doctor viewing a patient's dashboard
            if (isDoctorLoggedIn) {
                try {
                    const patient = await getPatient(patientId);
                    if (patient) {
                        setPatientData(patient);
                    } else {
                        setError(`Patient with ID ${patientId} not found.`);
                    }
                } catch (e) {
                    console.error("Failed to load patient data for doctor:", e);
                    setError('Failed to load patient data.');
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            // Flow for a patient accessing the dashboard.
            // We verify their "logged-in" status via localStorage.
            const storedPatientId = localStorage.getItem('patient_id');

            if (storedPatientId === patientId) {
                 try {
                    const patient = await getPatient(patientId);
                    if (patient) {
                        setPatientData(patient);
                    } else {
                        // This case can happen if the patient was deleted after login.
                        setError(`Patient with ID ${patientId} not found.`);
                        localStorage.removeItem('patient_id');
                    }
                } catch (e) {
                    console.error("Failed to load patient data for patient:", e);
                    setError('Failed to load your dashboard. Please try logging in again.');
                    localStorage.removeItem('patient_id');
                } finally {
                    setIsLoading(false);
                }
            } else {
                // If the stored ID doesn't match, or doesn't exist, the user is not authenticated for this page.
                // Redirect them to the login page.
                router.replace('/'); 
            }
        };

        loadData();

    }, [patientId, setPatientData, router, isDoctorLoggedIn, isClient]);

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
    
    // If there are no errors and loading is complete, render the dashboard.
    return <PatientDashboard />;
}
