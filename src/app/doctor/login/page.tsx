
'use client';

import * as React from 'react';
import Link from 'next/link';

export default function DoctorLoginPage() {
    // This is a placeholder page. The main functionality has been moved to the dashboard.
    // This file can be removed if a login flow is not needed in the future.
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold">This page is not in use.</h1>
                <p className="text-muted-foreground">The doctor's portal is currently in a single-user mode.</p>
                <Link href="/doctor/dashboard">
                    <p className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground">Go to Dashboard</p>
                </Link>
            </div>
        </div>
    );
}
