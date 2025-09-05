

'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useParams, useRouter } from 'next/navigation';
import PatientDashboard from '@/app/patient/dashboard/page';
import { getPatient } from '@/lib/firestore';
import { Button } from '@/components/ui/button';

export default function PatientDashboardPage() {
    const { setPatientData, isClient } = useApp();
    const router = useRouter();
    const params = useParams();
    const patientId = params.patientId as string;
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        console.log("PatientDashboardPage: useEffect triggered.");
        if (!patientId || !isClient) {
            console.log("PatientDashboardPage: Aborting effect - patientId or isClient is falsy.", { patientId, isClient });
            return;
        }

        const loadData = async () => {
            console.log(`PatientDashboardPage: Starting data load for patientId: ${patientId}`);
            setIsLoading(true);
            setError(null);
            try {
                const patient = await getPatient(patientId);
                 console.log("PatientDashboardPage: getPatient call completed. Patient data:", patient);
                if (patient) {
                    setPatientData(patient);
                    console.log("PatientDashboardPage: Patient data set in context.");
                } else {
                    setError(`No patient found with ID ${patientId}. Please check the link.`);
                    localStorage.removeItem('patient_id');
                    console.error(`PatientDashboardPage: No patient found for ID: ${patientId}`);
                }
            } catch (e) {
                console.error("PatientDashboardPage: Error in loadData:", e);
                setError('Could not load patient dashboard. Please try again or contact your doctor.');
                localStorage.removeItem('patient_id');
            } finally {
                console.log("PatientDashboardPage: loadData finished.");
                setIsLoading(false);
            }
        };

        loadData();

    }, [patientId, setPatientData, router, isClient]);

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
    
    console.log("PatientDashboardPage: Rendering PatientDashboard component.");
    return <PatientDashboard />;
}
