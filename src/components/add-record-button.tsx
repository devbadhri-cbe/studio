
'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircle } from 'lucide-react';

interface AddRecordButtonProps extends ButtonProps {
  tooltipContent: string;
}

export const AddRecordButton = React.forwardRef<HTMLButtonElement, AddRecordButtonProps>(
  ({ tooltipContent, className, ...props }, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={ref} size="sm" className="h-9 gap-1" {...props}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Record</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
);

AddRecordButton.displayName = 'AddRecordButton';
