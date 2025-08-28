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

            // This is the new, robust flow for a patient accessing via a direct link.
            try {
                // First, fetch the patient data using the ID from the URL.
                const patient = await getPatient(patientId);
                
                if (patient) {
                    // If the patient is found, "log them in" by setting their data
                    // in the application context and local storage.
                    localStorage.setItem('patient_id', patient.id);
                    setPatientData(patient);
                } else {
                    // If the patient ID is invalid, show an error and redirect to the login page.
                    setError(`No patient found with this ID. Redirecting to login...`);
                    // Using a timeout to allow the user to read the error message.
                    setTimeout(() => router.push('/'), 2000); 
                }
            } catch (e) {
                console.error("Direct link access failed:", e);
                setError('An error occurred while trying to load the dashboard. Please check your connection and try again.');
            } finally {
                setIsLoading(false);
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
