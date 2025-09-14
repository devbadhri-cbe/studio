'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import { calculateAge, formatDisplayPhoneNumber } from '@/lib/utils';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Separator } from '@/components/ui/separator';
import { Hba1cChart } from '@/components/hba1c-chart';
import { BloodPressureChart } from '@/components/blood-pressure-chart';
import { WeightChart } from '@/components/weight-chart';
import { LipidChart } from '@/components/lipid-chart';
import { format } from 'date-fns';
import { ActionIcon } from '@/components/ui/action-icon';

export default function HealthReportPage() {
  const { patient, isClient } = useApp();
  const router = useRouter();
  const formatDate = useDateFormatter();

  React.useEffect(() => {
    if (!isClient) return;
    if (!patient) {
      router.replace('/patient/dashboard');
    }
  }, [patient, isClient, router]);

  if (!isClient || !patient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading Report...</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const age = calculateAge(patient.dob);
  const formattedPhone = formatDisplayPhoneNumber(patient.phone, patient.country);

  return (
    <div className="bg-background min-h-screen">
       <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b no-print p-2">
        <div className="container mx-auto flex items-center justify-between">
          <ActionIcon 
            tooltip="Back to Dashboard"
            icon={<ArrowLeft />}
            onClick={() => router.back()}
          />
          <div className="flex-1 text-center font-bold">
            Health Report
          </div>
          <ActionIcon 
            tooltip="Print / Save as PDF"
            icon={<Printer />}
            onClick={handlePrint}
          />
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 printable-area max-w-5xl">
        <div className="p-8 border rounded-lg bg-card text-card-foreground">
          {/* Report Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary">{patient.name}</h1>
              <p className="text-muted-foreground">Confidential Health Report</p>
            </div>
            <Logo className="h-16 w-16" />
          </div>
          
          <Separator className="my-8" />

          {/* Patient Details */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Patient Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <p><strong>Date of Birth:</strong> {formatDate(patient.dob)} ({age} years)</p>
                <p><strong>Gender:</strong> <span className="capitalize">{patient.gender}</span></p>
                <p><strong>Phone:</strong> {formattedPhone}</p>
                <p><strong>Email:</strong> {patient.email}</p>
                 <p className="md:col-span-2"><strong>BMI:</strong> {patient.bmi ? patient.bmi.toFixed(1) : 'N/A'}</p>
            </div>
          </section>

           <Separator className="my-8" />

          {/* Medical History */}
          <section className="mb-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">Medical Conditions</h2>
                  {patient.presentMedicalConditions.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {patient.presentMedicalConditions.map(c => <li key={c.id}>{c.condition}</li>)}
                    </ul>
                  ) : <p className="text-muted-foreground text-sm">No conditions reported.</p>}
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">Current Medications</h2>
                   {patient.medication.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {patient.medication.map(m => <li key={m.id}>{m.name} {m.dosage} - {m.frequency}</li>)}
                    </ul>
                  ) : <p className="text-muted-foreground text-sm">No medications reported.</p>}
                </div>
             </div>
          </section>

          <Separator className="my-8" />

          {/* Charts and Data */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Biomarker Trends</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="min-h-[300px]">
                <h3 className="font-medium mb-2 text-center">HbA1c</h3>
                <Hba1cChart />
              </div>
              <div className="min-h-[300px]">
                <h3 className="font-medium mb-2 text-center">Blood Pressure</h3>
                <BloodPressureChart />
              </div>
              <div className="min-h-[300px]">
                <h3 className="font-medium mb-2 text-center">Weight</h3>
                <WeightChart />
              </div>
               <div className="min-h-[300px]">
                <h3 className="font-medium mb-2 text-center">Lipid Panel</h3>
                <LipidChart />
              </div>
            </div>
          </section>

          <Separator className="my-8" />
          
          <footer className="text-center text-xs text-muted-foreground">
            <p>This report is a summary of data entered by the patient and is intended for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
             <p className="mt-2">Report generated on: {format(new Date(), 'PPP p')}</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
