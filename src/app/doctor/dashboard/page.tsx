
'use client';
// This file is no longer in use as the doctor-centric dashboard has been removed
// in favor of a patient-centric, local-first data model.
// Patients now manage their own data on their device.
// This file is retained as a placeholder to prevent build errors from dangling links
// but will be removed in a future cleanup.

import { redirect } from 'next/navigation';
import * as React from 'react';

export default function DeprecatedDoctorDashboard() {
    React.useEffect(() => {
        redirect('/patient/login');
    }, []);

    return null;
}
