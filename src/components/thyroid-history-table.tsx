
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye } from 'lucide-react';

import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ThyroidRecord } from '@/lib/types';

const RECORDS_PER_PAGE = 5;

export function ThyroidHistoryTable() {
  const { thyroidRecords, removeThyroidRecord } = useApp();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedRecord, setSelectedRecord] = React.useState<ThyroidRecord | null>(null);

  const sortedRecords = React.useMemo(() => {
    return [...(thyroidRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [thyroidRecords]);

  const totalPages = Math.ceil(sortedRecords.length / RECORDS_PER_PAGE);
  
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  const getStatus = (value: number) => {
    if (value < 0.4) return { text: 'Low (Hyper)', variant: 'secondary' as const };
    if (value > 4.0) return { text: 'High (Hypo)', variant: 'destructive' as const };
    return { text: 'Normal', variant: 'outline' as const };
  }

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
    <div className="flex flex-col">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-2 md:px-4">Date</TableHead>
              <TableHead className="px-2 md:px-4">TSH</TableHead>
              <TableHead className="px-2 md:px-4">T3</TableHead>
              <TableHead className="px-2 md:px-4">T4</TableHead>
              <TableHead className="px-2 md:px-4">TSH Status</TableHead>
              <TableHead className="text-right px-2 md:px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => {
                  const status = getStatus(record.tsh);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium px-2 md:px-4">
                        {format(new Date(record.date), 'dd-MM-yyyy')}
                      </TableCell>
                      <TableCell className="px-2 md:px-4">{record.tsh.toFixed(2)}</TableCell>
                      <TableCell className="px-2 md:px-4">{record.t3}</TableCell>
                      <TableCell className="px-2 md:px-4">{record.t4}</TableCell>
                      <TableCell className="px-2 md:px-4">
                        <Badge variant={status.variant} className={status.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>{status.text}</Badge>
                      </TableCell>
                      <TableCell className="text-right px-2 md:px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuItem onSelect={() => setSelectedRecord(record)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Medication
                             </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => removeThyroidRecord(record.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
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
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end space-x-2">
           <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medication Details</DialogTitle>
            <DialogDescription>
              Medication taken at the time of the test on {selectedRecord ? format(new Date(selectedRecord.date), 'MMMM d, yyyy') : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
             {selectedRecord?.medication && selectedRecord.medication !== 'N/A' ? (
                <ol className="list-decimal list-inside space-y-2 rounded-md border bg-muted p-4 text-sm font-medium">
                  {parseMedicationString(selectedRecord.medication).map((med, index) => (
                    <li key={index}>
                      {med.name} {med.dosage} - {med.frequency}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="rounded-md border bg-muted p-4 text-sm font-medium">
                  No medication was recorded for this test.
                </p>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
