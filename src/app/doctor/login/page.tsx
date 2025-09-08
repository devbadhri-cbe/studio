
'use client';

import * as React from 'react';
import Link from 'next/link';
import { doctorDetails } from '@/lib/doctor-data';

export default function DoctorLoginPage() {
    // This is a placeholder page. The main functionality has been moved to the dashboard.
    // This file can be removed if a login flow is not in the future.
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="text-center max-w-md">
                <h1 className="text-2xl font-bold">Doctor's Portal</h1>
                <p className="text-muted-foreground mt-2">
                   This is a private portal. Your patient can share a link to this page with you.
                </p>
                 <p className="text-muted-foreground mt-4 text-sm">
                   To request login credentials, please contact the administrator at: <a href={`mailto:${doctorDetails.developerEmail}`} className="text-primary underline">{doctorDetails.developerEmail}</a>
                </p>
                <Link href="/doctor/dashboard">
                    <p className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground">Proceed to Login</p>
                </Link>
            </div>
        </div>
    );
}
