import * as React from 'react';
import { getAllPatients } from '@/lib/firestore';
import { TitleBar } from '@/components/ui/title-bar';
import { PatientListClient } from '@/components/patient-list-client';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Patient } from '@/lib/types';

export default async function DoctorDashboardPage() {
  const allPatients = await getAllPatients();

  const patientNeedsReview = (patient: Patient) => {
    return patient.presentMedicalConditions?.some(c => c.status === 'pending_review') || patient.dashboardSuggestions?.some(s => s.status === 'pending');
  }

  const statusPriority: { [key in Patient['status']]: number } = {
    'Urgent': 1,
    'Needs Review': 2,
    'On Track': 3,
  };

  const sortedPatients = allPatients.sort((a, b) => {
    const aNeedsReview = patientNeedsReview(a);
    const bNeedsReview = patientNeedsReview(b);

    if (aNeedsReview && !bNeedsReview) return -1;
    if (!aNeedsReview && bNeedsReview) return 1;

    const aDate = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
    const bDate = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
    if (aDate !== bDate) {
      return bDate - aDate;
    }

    const priorityA = statusPriority[a.status] || 4;
    const priorityB = statusPriority[b.status] || 4;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a.name.localeCompare(b.name);
  });

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <TitleBar />
        <main className="flex-1 p-4 md:p-6">
          <PatientListClient initialPatients={sortedPatients} />
        </main>
      </div>
    </TooltipProvider>
  );
}
