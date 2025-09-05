'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import PatientDashboard from '../dashboard/page';

// This page now directly renders the dashboard component.
export default function PatientDashboardPage() {
    return <PatientDashboard />;
}
