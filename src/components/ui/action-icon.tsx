
'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ActionIconProps extends ButtonProps {
  tooltip: string;
  icon: React.ReactNode;
}

export const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
  ({ tooltip, icon, className, ...props }, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={ref} size="icon" variant="ghost" className={cn("h-8 w-8", className)} {...props}>
            {icon}
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
);

ActionIcon.displayName = 'ActionIcon';
