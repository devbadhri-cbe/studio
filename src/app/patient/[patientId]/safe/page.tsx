
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { getPatient } from '@/lib/firestore';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SafeModePage() {
    const params = useParams();
    const patientId = params.patientId as string;
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [patient, setPatient] = React.useState<Patient | null>(null);

    React.useEffect(() => {
        if (!patientId) return;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log(`[SAFE MODE] Fetching patient with ID: ${patientId}`);
                const patientData = await getPatient(patientId);
                console.log(`[SAFE MODE] getPatient returned:`, patientData);

                if (patientData) {
                    setPatient(patientData);
                } else {
                    setError(`[SAFE MODE] No patient found with ID ${patientId}.`);
                }
            } catch (e: any) {
                console.error("[SAFE MODE] Error in loadData:", e);
                setError(`[SAFE MODE] Could not load patient data. Error: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [patientId]);

    return (
        <div className="flex h-screen items-center justify-center bg-muted p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Safe Mode Diagnostic</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p>Loading patient data...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-destructive">
                            <p className="font-bold">An error occurred:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {patient && (
                        <div className="text-green-600">
                            <p className="font-bold">Success!</p>
                            <p>Patient Name: {patient.name}</p>
                            <p>Data loaded successfully. The issue is likely in a dashboard component.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
