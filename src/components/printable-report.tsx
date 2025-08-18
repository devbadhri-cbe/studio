'use client';

import { useApp } from '@/context/app-context';
import { Logo } from './logo';
import { Hba1cChart } from './hba1c-chart';
import { format } from 'date-fns';
import { calculateAge } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function PrintableReport() {
  const { profile, records, isClient } = useApp();

  if (!isClient) return null;

  const age = calculateAge(profile.dob);
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  return (
    <div className="hidden print-only">
      <div className="p-8">
        <header className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary font-headline">Health Guardian</h1>
              <p className="text-sm text-muted-foreground">HbA1c Health Report</p>
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
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{profile.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{profile.dob ? format(new Date(profile.dob), 'dd-MM-yyyy') : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-medium">{age !== null ? `${age} years` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Present Medical Conditions</p>
              <p className="font-medium">{profile.presentMedicalConditions || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Medication</p>
              <p className="font-medium">{profile.medication || 'N/A'}</p>
            </div>
          </div>
        </section>

        <section className="my-8">
          <h2 className="mb-4 text-xl font-semibold">HbA1c Trend</h2>
          <div className="rounded-lg border p-4">
            <Hba1cChart />
          </div>
        </section>

        <section className="my-8">
          <h2 className="mb-4 text-xl font-semibold">Complete History</h2>
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
                {sortedRecords.length > 0 ? (
                  sortedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), 'dd-MM-yyyy')}</TableCell>
                      <TableCell className="font-mono">{record.value.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{record.medication || 'N/A'}</TableCell>
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
        <footer className="mt-12 border-t pt-4 text-center text-xs text-muted-foreground">
          <p>This report is generated for personal tracking purposes and should not replace professional medical advice.</p>
          <p>Health Guardian &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
