
'use client';

import { Logo } from '@/components/logo';
import { Mail } from 'lucide-react';
import * as React from 'react';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

interface TitleBarProps {
    children?: React.ReactNode;
}

export function TitleBar({ children }: TitleBarProps) {

    return (
        <header className="border-b px-4 py-2 md:px-6">
            <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
                 <div className="flex justify-start items-center gap-2 w-24">
                    {children}
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2">
                            <Logo className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                            <div className="flex flex-col md:flex-row md:items-center md:gap-2 text-3xl md:text-4xl font-bold font-headline">
                                <span className="md:inline">Health</span>
                                <span className="md:inline">Guardian</span>
                            </div>
                        </div>
                        <div className="text-center text-xs text-muted-foreground">
                            by
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                            <p className="font-semibold text-lg text-foreground">Dr. Badhrinathan N</p>
                            <a href={`mailto:drbadhri@gmail.com`} className="flex items-center justify-center gap-1.5 hover:text-primary">
                                <Mail className="h-3 w-3" />
                                drbadhri@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end w-24">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}

