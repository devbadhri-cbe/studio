
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
          <Button ref={ref} size="icon" variant="outline" className="h-8 w-8" {...props}>
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">{tooltipContent}</span>
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
