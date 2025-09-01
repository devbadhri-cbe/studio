
'use client';

import * as React from 'react';
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
import type { RenalRecord } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useDateFormatter } from '@/hooks/use-date-formatter';

const RECORDS_PER_PAGE = 5;

export function RenalHistoryTable() {
  const { renalRecords, removeRenalRecord } = useApp();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedRecord, setSelectedRecord] = React.useState<RenalRecord | null>(null);
  const formatDate = useDateFormatter();

  const sortedRecords = React.useMemo(() => {
    return [...(renalRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [renalRecords]);

  const totalPages = Math.ceil(sortedRecords.length / RECORDS_PER_PAGE);
  
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  const getStatus = (egfr: number, uacr: number) => {
    if (egfr < 60 || uacr > 30) return { text: 'High Risk', variant: 'destructive' as const };
    if (egfr < 90 || uacr > 0) return { text: 'Needs Monitoring', variant: 'secondary' as const };
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
              <TableHead className="px-2 md:px-4">eGFR</TableHead>
              <TableHead className="px-2 md:px-4">UACR (mg/g)</TableHead>
              <TableHead className="px-2 md:px-4">Status</TableHead>
              <TableHead className="text-right px-2 md:px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => {
                  const status = getStatus(record.egfr, record.uacr);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium px-2 md:px-4">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell className="px-2 md:px-4">{record.egfr}</TableCell>
                      <TableCell className="px-2 md:px-4">{record.uacr}</TableCell>
                      <TableCell className="px-2 md:px-4">
                        <Badge variant={status.variant} className={status.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>{status.text}</Badge>
                      </TableCell>
                      <TableCell className="text-right px-2 md:px-4">
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                             <TooltipContent>More options</TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuItem onSelect={() => setSelectedRecord(record)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Medication
                             </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => removeRenalRecord(record.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous page</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next page</TooltipContent>
          </Tooltip>
        </div>
      )}

      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medication Details</DialogTitle>
            <DialogDescription>
              Medication taken at the time of the test on {selectedRecord ? formatDate(selectedRecord.date) : ''}.
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
