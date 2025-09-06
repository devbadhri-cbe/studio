
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Flame, Settings } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddLipidRecordDialog } from './add-lipid-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { LipidChart } from './lipid-chart';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BiomarkerCardTemplate } from './biomarker-card-template';

interface LipidCardProps {
  isReadOnly?: boolean;
}

export function LipidCard({ isReadOnly = false }: LipidCardProps) {
  const { lipidRecords, removeLipidRecord } = useApp();
  const formatDate = useDateFormatter();
  const [, setForceRender] = React.useState(0);

  const sortedRecords = React.useMemo(() => {
    return [...(lipidRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [lipidRecords]);
  
  const getStatus = (ldl: number) => {
    if (ldl < 100) return { text: 'Optimal', variant: 'outline' as const };
    if (ldl < 130) return { text: 'Near Optimal', variant: 'default' as const };
    if (ldl < 160) return { text: 'Borderline High', variant: 'secondary' as const };
    if (ldl < 190) return { text: 'High', variant: 'destructive' as const };
    return { text: 'Very High', variant: 'destructive' as const };
  }
  
  const handleSuccess = () => {
    setForceRender(c => c + 1);
  }

  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord.ldl) : null;

  const Title = 'Lipid Panel';
  const Icon = <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = !isReadOnly ? (
     <AddLipidRecordDialog onSuccess={handleSuccess}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Add New Record
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
     </AddLipidRecordDialog>
  ) : null;

  const RecordsList = (
    <ScrollArea className="h-full max-h-[100px] w-full">
        <ul className="space-y-1 mt-2">
          {sortedRecords.map((record) => (
              <li key={record.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                  <p className="flex-1">
                      <span className="font-semibold text-foreground">LDL: {record.ldl}</span>
                      <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
                  </p>
                  <div className="flex items-center shrink-0">
                  {!isReadOnly && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeLipidRecord(record.id)}>
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
      {currentStatus ? (
        <div className="flex flex-col items-center gap-1">
            <span>LDL Status:</span>
            <Badge variant={currentStatus.variant} className={currentStatus.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>
            {currentStatus.text}
            </Badge>
        </div>
      ) : <p>No status</p>}
    </div>
  );

  const Chart = <LipidChart />;
  
  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      recordsList={RecordsList}
      statusDisplay={StatusDisplay}
      chart={Chart}
      className="shadow-xl"
      hasRecords={(lipidRecords || []).length > 0}
      noRecordsMessage="No lipid panel records yet."
      statusVariant={currentStatus?.variant}
    />
  );
}
