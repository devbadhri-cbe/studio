
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Edit, Trash2, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { ScrollArea } from './ui/scroll-area';

interface RecordItem {
  id: string;
  date: string;
  displayValue: string;
}

interface BiomarkerCardTemplateProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  statusDisplay?: React.ReactNode;
  chart?: React.ReactNode;
  className?: string;
  hasRecords?: boolean;
  noRecordsMessage?: string;
  statusVariant?: 'destructive' | 'secondary' | 'outline' | 'default';
  records?: RecordItem[];
  onDeleteRecord?: (id: string) => void;
  isReadOnly?: boolean;
  children?: React.ReactNode;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
}

export function BiomarkerCardTemplate({
  title,
  description,
  icon,
  actions,
  statusDisplay,
  chart,
  className,
  hasRecords = false,
  noRecordsMessage = "No records yet.",
  statusVariant = 'default',
  records = [],
  onDeleteRecord = () => {},
  isReadOnly = false,
  children,
  isEditMode,
  setIsEditMode,
}: BiomarkerCardTemplateProps) {
  const formatDate = useDateFormatter();

  const getBorderColorClass = () => {
    switch (statusVariant) {
        case 'destructive':
            return 'border-destructive';
        case 'secondary':
            return 'border-yellow-500';
        case 'outline':
            return 'border-green-500';
        default:
            return 'border-transparent';
    }
  }

  const RecordsList = (
    <ScrollArea className="h-full max-h-[100px] w-full">
        <ul className="space-y-1 mt-2">
          {records.map((record) => (
              <li key={record.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                  <p className="flex-1">
                      <span className="font-semibold text-foreground">{record.displayValue}</span>
                      <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
                  </p>
                  <div className="flex items-center shrink-0">
                  {isEditMode && !isReadOnly && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => onDeleteRecord(record.id)}>
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
  
  if (children) {
    return (
        <Card className={cn("w-full h-full shadow-xl", className)}>
            <CardContent className="p-4 flex items-center gap-4">
                 <div className="flex-shrink-0">{icon}</div>
                 <div className="flex-1">
                    {children}
                 </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className={cn("w-full flex flex-col h-full shadow-xl", className)}>
      <CardHeader>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <CardTitle>{title}</CardTitle>
                  {description && <CardDescription>{description}</CardDescription>}
                </div>
              </div>
               <div className="flex items-center gap-1 shrink-0">
                  {actions}
              </div>
          </div>
        </CardHeader>
      <CardContent className="flex flex-col flex-1 h-full text-sm p-4 pt-0 space-y-4">
        {hasRecords ? (
          <div className="flex-1 flex flex-col min-h-0">
              {/* Top Section: Records & Status */}
              <div className={cn("flex-1 flex flex-col gap-4 min-h-0 border-2 rounded-lg p-2", getBorderColorClass())}>
                  <div className="flex-1 w-full flex items-center justify-center">
                      {RecordsList}
                  </div>
                  <div className="flex-1 w-full flex items-center justify-center">
                      {statusDisplay}
                  </div>
              </div>
              
              <Separator className="my-4" />

              {/* Bottom Section: Chart */}
              <div className="h-[250px] w-full rounded-lg p-2 flex flex-col">
                  {chart}
              </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4 min-h-[200px]">
              <p className="text-sm">{noRecordsMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
