
'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockPatients } from '@/lib/mock-data';
import type { Patient } from '@/lib/types';
import { format } from 'date-fns';
import { AddPatientDialog } from '@/components/add-patient-dialog';

export default function DoctorDashboardPage() {
    const router = useRouter();
    const doctorName = 'Dr. Badhrinathan N';

    const getStatusVariant = (status: Patient['status']) => {
        switch (status) {
            case 'Urgent':
                return 'destructive';
            case 'Needs Review':
                return 'secondary';
            case 'On Track':
                return 'outline';
            default:
                return 'default';
        }
    }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
       <header className="border-b px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
            </div>
             <div className="flex items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">{doctorName}</p>
                  <a href="mailto:drbadhri@gmail.com" className="flex items-center justify-end gap-1.5 hover:text-primary">
                    <Mail className="h-3 w-3" />
                    drbadhri@gmail.com
                  </a>
                  <a href="tel:+919791377716" className="flex items-center justify-end gap-1.5 hover:text-primary">
                    <Phone className="h-3 w-3" />
                    +91 9791377716
                  </a>
                </div>
            </div>
          </div>
        </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto w-full max-w-7xl">
            <h1 className="text-2xl md:text-3xl font-semibold font-headline">
                Patient Overview
            </h1>
            <p className="text-muted-foreground mb-6">Manage and review your patients' health data.</p>

            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Patient List</CardTitle>
                        <CardDescription>A list of all patients currently under your care.</CardDescription>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <AddPatientDialog />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient Name</TableHead>
                                <TableHead>Last HbA1c (%)</TableHead>
                                <TableHead>Last LDL (mg/dL)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPatients.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-medium">{patient.name}</TableCell>
                                    <TableCell>
                                        {patient.lastHba1c 
                                            ? `${patient.lastHba1c.value.toFixed(1)} on ${format(new Date(patient.lastHba1c.date), 'dd-MM-yyyy')}` 
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {patient.lastLipid 
                                            ? `${patient.lastLipid.ldl} on ${format(new Date(patient.lastLipid.date), 'dd-MM-yyyy')}`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(patient.status)} className={getStatusVariant(patient.status) === 'outline' ? 'border-green-500 text-green-600' : ''}>
                                            {patient.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => router.push('/')} // This will be dynamic later
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Dashboard
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
