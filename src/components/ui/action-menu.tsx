'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionIcon } from './action-icon';

interface ActionMenuProps {
  tooltip: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function ActionMenu({ tooltip, icon, children, align = 'end' }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionIcon
          tooltip={tooltip}
          icon={icon}
          onClick={(e) => e.stopPropagation()}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} onClick={(e) => e.stopPropagation()}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
