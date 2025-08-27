
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useParams, useRouter } from 'next/navigation';
import type { Patient } from '@/lib/types';
import PatientDashboard from '@/app/patient/dashboard/page';

export default function PatientDashboardPage() {
    const { setPatientData, isDoctorLoggedIn } = useApp();
    const router = useRouter();
    const params = useParams();
    const patientId = params.patientId as string;
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!patientId) return;

        try {
            const storedPatients = localStorage.getItem('doctor-patients');
            const doctorLoggedIn = localStorage.getItem('doctor_logged_in');

            // Use both the app context and local storage for a robust check
            if (!doctorLoggedIn && !isDoctorLoggedIn) {
                setError('Access denied. Please log in as a doctor.');
                setIsLoading(false);
                // Optional: redirect to login
                // router.push('/doctor/login');
                return;
            }

            if (storedPatients) {
                const patients: Patient[] = JSON.parse(storedPatients);
                const patient = patients.find(p => p.id === patientId);

                if (patient) {
                    // Ensure all optional record arrays exist
                    patient.records = patient.records || [];
                    patient.lipidRecords = patient.lipidRecords || [];
                    patient.vitaminDRecords = patient.vitaminDRecords || [];
                    patient.thyroidRecords = patient.thyroidRecords || [];
                    patient.weightRecords = patient.weightRecords || [];
                    patient.bloodPressureRecords = patient.bloodPressureRecords || [];
                    patient.medication = patient.medication || [];
                    patient.presentMedicalConditions = patient.presentMedicalConditions || [];
                    
                    setPatientData(patient);
                } else {
                    setError(`Patient with ID ${patientId} not found.`);
                }
            } else {
                setError('No patient data found.');
            }
        } catch (e) {
            console.error("Failed to load patient data:", e);
            setError('Failed to load patient data.');
        } finally {
            setIsLoading(false);
        }

    }, [patientId, setPatientData, router, isDoctorLoggedIn]);

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
            <div className="flex h-screen items-center justify-center bg-background text-destructive">
                <p>{error}</p>
            </div>
        );
    }
    
    // Once data is loaded and there's no error, render the main Home/Dashboard component
    return <PatientDashboard />;
}
