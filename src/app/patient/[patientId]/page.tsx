
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useParams, useRouter } from 'next/navigation';
import PatientDashboard from '@/app/patient/dashboard/page';
import { getPatient } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function PatientDashboardPage() {
    const { setPatientData, isDoctorLoggedIn, isClient } = useApp();
    const router = useRouter();
    const { toast } = useToast();
    const params = useParams();
    const patientId = params.patientId as string;
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!patientId || !isClient) return;

        const verifyAccessAndLoadData = async () => {
            // A doctor is logged in via Firebase Auth, they have access.
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
            
            // This handles the patient flow, using the ID from the URL as the source of truth.
            try {
                const patient = await getPatient(patientId);
                if (patient) {
                    // "Log in" the patient by setting their data in the app context and local storage.
                    localStorage.setItem('patient_id', patient.id);
                    setPatientData(patient);
                } else {
                    // If the ID from the link is invalid, show an error.
                    setError(`No patient found for this link. Please check the ID and try again.`);
                }
            } catch (e) {
                console.error("Direct link access failed:", e);
                // This can happen if Firestore rules deny access, which might be the case for an unauthenticated user on mobile.
                // The key is to fetch data and then set state, rather than relying on state first.
                setError('An error occurred while trying to load the dashboard. This may be due to a permission issue.');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAccessAndLoadData();

    }, [patientId, setPatientData, router, toast, isDoctorLoggedIn, isClient]);

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
