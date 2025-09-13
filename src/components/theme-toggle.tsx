
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/context/app-context';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function ThemeToggle() {
  const { theme, setTheme } = useApp();

  return (
      <DropdownMenu>
        <Tooltip>
            <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
                <p>Toggle Theme</p>
            </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
            <DropdownMenuRadioItem value="light">
              Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
