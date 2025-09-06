
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Settings, Beaker } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import type { CustomBiomarker } from '@/lib/types';
import { AddCustomRecordDialog } from './add-custom-record-dialog';
import { CustomBiomarkerChart } from './custom-biomarker-chart';

interface CustomBiomarkerCardProps {
  biomarker: CustomBiomarker;
  isReadOnly?: boolean;
}

export function CustomBiomarkerCard({ biomarker, isReadOnly = false }: CustomBiomarkerCardProps) {
  const { removeCustomBiomarker, profile, removeCustomBiomarkerRecord } = useApp();
  const formatDate = useDateFormatter();
  const [isAddRecordOpen, setIsAddRecordOpen] = React.useState(false);
  
  const records = profile.customBiomarkerRecords?.[biomarker.id] || [];

  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
  }, [records]);

  const Title = biomarker.name;
  const Icon = <Beaker className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = !isReadOnly ? (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
              </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuItem onSelect={() => setIsAddRecordOpen(true)}>Add New Record</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => removeCustomBiomarker(biomarker.id)} className="text-destructive">
                Delete Biomarker Card
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  const RecordsList = (
    <ScrollArea className="h-full max-h-[100px] w-full">
        <ul className="space-y-1 mt-2">
          {sortedRecords.map((record) => (
              <li key={record.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                  <p className="flex-1">
                      <span className="font-semibold text-foreground">{record.value} {record.unit}</span>
                      <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
                  </p>
                  <div className="flex items-center shrink-0">
                  {!isReadOnly && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeCustomBiomarkerRecord(biomarker.id, record.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete record</TooltipContent>
                    </Tooltip>
                  )}
                  </div>
              </li>
            ))}
        </ul>
    </ScrollArea>
  );

  const StatusDisplay = (
    <div className="text-center text-xs text-muted-foreground flex items-center justify-center h-full">
      <p>No status available for custom biomarkers.</p>
    </div>
  );

  const Chart = <CustomBiomarkerChart biomarkerId={biomarker.id} />;
  
  return (
    <>
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      recordsList={RecordsList}
      statusDisplay={StatusDisplay}
      chart={Chart}
      hasRecords={records.length > 0}
      statusVariant="default"
    />
    <AddCustomRecordDialog
      open={isAddRecordOpen}
      onOpenChange={setIsAddRecordOpen}
      biomarker={biomarker}
    />
    </>
  );
}
