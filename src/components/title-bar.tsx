

'use client';

import { Logo } from '@/components/logo';
import { Mail } from 'lucide-react';
import * as React from 'react';
import { ThemeToggle } from './theme-toggle';

interface TitleBarProps {
    doctorName?: string;
    doctorEmail?: string;
    children?: React.ReactNode;
}

export function TitleBar({ doctorName, doctorEmail, children }: TitleBarProps) {
    return (
        <header className="border-b px-4 py-4 md:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 relative">
                 <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <ThemeToggle />
                </div>
                 {children}
                <div className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
                </div>
                 <div className="text-center text-xs text-muted-foreground">
                    by Dr. Badhrinathan N
                </div>
                {doctorName && doctorEmail && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                        <p className="font-semibold text-lg text-foreground">{doctorName}</p>
                        <a href={`mailto:${doctorEmail}`} className="flex items-center justify-center gap-1.5 hover:text-primary">
                            <Mail className="h-3 w-3" />
                            {doctorEmail}
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
}
