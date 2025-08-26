
'use client';

import { useApp } from '@/context/app-context';
import { Logo } from './logo';
import { Hba1cChart } from './hba1c-chart';
import { format } from 'date-fns';
import { calculateAge } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { LdlChart } from './ldl-chart';
import { Mail, Phone, User, Cake, VenetianMask } from 'lucide-react';


export function PrintableReport() {
  const { profile, records, lipidRecords, isClient } = useApp();

  if (!isClient) return null;

  const age = calculateAge(profile.dob);
  const sortedHba1cRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedLipidRecords = [...lipidRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const parseMedicationString = (medication?: string): { name: string; dosage: string; frequency: string }[] => {
    if (!medication || medication === 'N/A') return [];
    try {
      const meds = JSON.parse(medication);
      if (Array.isArray(meds)) return meds;
      return [];
    } catch (e) {
      return [];
    }
  };


  return (
    <div className="p-8">
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-primary font-headline">Health Guardian</h1>
            <p className="text-sm text-muted-foreground">Health Report</p>
          </div>
        </div>
        <div className="text-right text-sm">
            <p>
              Report Generated: <strong>{format(new Date(), 'dd-MM-yyyy')}</strong>
            </p>
        </div>
      </header>

      <section className="my-8">
        <h2 className="mb-4 text-xl font-semibold">Patient Information</h2>
        <div className="space-y-4 rounded-lg border p-6 bg-card">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                 <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{profile.name || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <VenetianMask className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Age & Gender</p>
                        <p className="font-medium">
                            {age !== null ? `${age} years` : 'N/A'}, <span className="capitalize">{profile.gender || 'N/A'}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{profile.email || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{profile.phone || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <div className='pt-4 border-t'>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Present Medical Conditions</p>
                {profile.presentMedicalConditions && profile.presentMedicalConditions.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                {profile.presentMedicalConditions.map(c => (
                    <li key={c.id} className="font-medium text-sm">
                    {c.condition} (Diagnosed: {format(new Date(c.date), 'dd-MM-yyyy')})
                    </li>
                ))}
                </ul>
                ) : (
                <p className="font-medium text-sm">N/A</p>
                )}
            </div>
            <div className='pt-4 border-t'>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Current Medication</p>
                {profile.medication && profile.medication.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                    {profile.medication.map(med => (
                    <li key={med.id} className="font-medium text-sm">
                        {med.name} {med.dosage} - {med.frequency}
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="font-medium text-sm">N/A</p>
                )}
            </div>
        </div>
      </section>

      <section className="my-8" style={{ pageBreakBefore: 'always' }}>
        <h2 className="mb-4 text-xl font-semibold">HbA1c Trend</h2>
        <div className="rounded-lg border p-4">
          <Hba1cChart />
        </div>
        <h2 className="my-4 text-xl font-semibold">HbA1c History</h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Result (%)</TableHead>
                <TableHead className='text-right'>Medication</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHba1cRecords.length > 0 ? (
                sortedHba1cRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), 'dd-MM-yyyy')}</TableCell>
                    <TableCell className="font-mono">{record.value.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{parseMedicationString(record.medication).map(m => m.name).join(', ') || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="my-8" style={{ pageBreakBefore: 'always' }}>
          <h2 className="mb-4 text-xl font-semibold">LDL Cholesterol Trend</h2>
        <div className="rounded-lg border p-4">
          <LdlChart />
        </div>
        <h2 className="my-4 text-xl font-semibold">Lipid Panel History</h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>LDL</TableHead>
                <TableHead>HDL</TableHead>
                <TableHead>Trig.</TableHead>
                <TableHead className="text-right">Medication</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLipidRecords.length > 0 ? (
                sortedLipidRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), 'dd-MM-yyyy')}</TableCell>
                    <TableCell>{record.total}</TableCell>
                    <TableCell>{record.ldl}</TableCell>
                    <TableCell>{record.hdl}</TableCell>
                    <TableCell>{record.triglycerides}</TableCell>
                    <TableCell className="text-right">{parseMedicationString(record.medication).map(m => m.name).join(', ') || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <footer className="mt-12 border-t pt-4 text-center text-xs text-muted-foreground">
        <p>This report is generated for personal tracking purposes and should not replace professional medical advice.</p>
        <p>Health Guardian &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
