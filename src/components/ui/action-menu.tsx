
'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionIcon } from './action-icon';
import { DropdownMenuContentProps, DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

interface ActionMenuProps extends DropdownMenuProps {
  tooltip: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  align?: DropdownMenuContentProps['align'];
}

export function ActionMenu({ tooltip, icon, children, align = 'end', ...props }: ActionMenuProps) {
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        <ActionIcon
          tooltip={tooltip}
          icon={icon}
          onClick={(e) => e.stopPropagation()}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side="bottom" onClick={(e) => e.stopPropagation()}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
