
'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';

// This page is temporarily redirected to a safe mode diagnostic page.
export default function PatientDashboardRedirector() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.patientId as string;

    React.useEffect(() => {
        if (patientId) {
            router.replace(`/patient/${patientId}/safe`);
        }
    }, [router, patientId]);

    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="ml-4">Redirecting to diagnostic mode...</p>
        </div>
    );
}
