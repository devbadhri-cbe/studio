
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useParams, useRouter } from 'next/navigation';
import PatientDashboard from '@/app/patient/dashboard/page';
import { getPatient, updatePatient } from '@/lib/firestore';
import { Button } from '@/components/ui/button';

export default function PatientDashboardPage() {
    const { setPatientData, isClient, doctor } = useApp();
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

            try {
                const patient = await getPatient(patientId);
                if (patient) {
                    if (doctor && patient.doctorId !== doctor.uid) {
                         setError(`This patient is managed by another doctor. Access denied.`);
                         localStorage.removeItem('patient_id');
                         return;
                    }

                    setPatientData(patient);
                    if (!doctor) { // Only update lastLogin if it's a patient logging in
                        await updatePatient(patient.id, { lastLogin: new Date().toISOString() });
                    }
                } else {
                    setError(`No patient found with ID ${patientId}. Please check the link.`);
                    localStorage.removeItem('patient_id');
                }
            } catch (e) {
                console.error("Failed to load patient data:", e);
                setError('Could not load patient dashboard. Please try again or contact your doctor.');
                localStorage.removeItem('patient_id');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

    }, [patientId, setPatientData, router, isClient, doctor]);

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
