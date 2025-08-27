
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useParams, useRouter } from 'next/navigation';
import PatientDashboard from '@/app/patient/dashboard/page';
import { getPatient } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function PatientDashboardPage() {
    const { setPatientData } = useApp();
    const router = useRouter();
    const { toast } = useToast();
    const params = useParams();
    const patientId = params.patientId as string;
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!patientId) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
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
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Could not fetch patient data from the cloud.'
                    });
                } finally {
                    setIsLoading(false);
                }
            } else {
                setError('Access denied. Please log in as a doctor.');
                setIsLoading(false);
                // Optional: redirect to login
                // router.push('/doctor/login');
            }
        });

        return () => unsubscribe();

    }, [patientId, setPatientData, router, toast]);

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
                <Button onClick={() => router.push('/doctor/login')} className="mt-4">Go to Login</Button>
            </div>
        );
    }
    
    // Once data is loaded and there's no error, render the main Home/Dashboard component
    return <PatientDashboard />;
}
