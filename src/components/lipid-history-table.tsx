'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const RECORDS_PER_PAGE = 5;

export function LipidHistoryTable() {
  const { lipidRecords, removeLipidRecord } = useApp();
  const [currentPage, setCurrentPage] = React.useState(1);

  const sortedRecords = React.useMemo(() => {
    return [...lipidRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [lipidRecords]);

  const totalPages = Math.ceil(sortedRecords.length / RECORDS_PER_PAGE);
  
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <div className="flex flex-col">
      <div className="rounded-lg border">
        <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-2 md:px-4">Date</TableHead>
              <TableHead className="px-2 md:px-4">Total</TableHead>
              <TableHead className="px-2 md:px-4">LDL</TableHead>
              <TableHead className="px-2 md:px-4">HDL</TableHead>
              <TableHead className="px-2 md:px-4">Trig.</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((record) => {
                return (
                  <Tooltip key={record.id} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <TableRow>
                        <TableCell className="font-medium px-2 md:px-4">{format(new Date(record.date), 'dd-MM-yyyy')}</TableCell>
                        <TableCell className="px-2 md:px-4">{record.total}</TableCell>
                        <TableCell className="px-2 md:px-4">{record.ldl}</TableCell>
                        <TableCell className="px-2 md:px-4">{record.hdl}</TableCell>
                        <TableCell className="px-2 md:px-4">{record.triglycerides}</TableCell>
                        <TableCell className="px-2 md:px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => removeLipidRecord(record.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TooltipTrigger>
                     <TooltipContent side="top" align="center">
                        <p className="text-xs text-muted-foreground">Medication when tested:</p>
                        <p className="font-semibold">{record.medication || 'N/A'}</p>
                      </TooltipContent>
                  </Tooltip>
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
        </TooltipProvider>
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
    </div>
  );
}
