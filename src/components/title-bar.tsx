
'use client';

import { Logo } from '@/components/logo';
import { Mail } from 'lucide-react';
import * as React from 'react';
import { ThemeToggle } from './theme-toggle';

interface TitleBarProps {
    children?: React.ReactNode;
}

export function TitleBar({ children }: TitleBarProps) {

    return (
        <header className="border-b px-4 py-4 md:px-6">
            <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between">
                <div className="flex w-1/3 justify-start">
                    {children}
                </div>
                <div className="flex w-1/3 justify-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <Logo className="h-8 w-8 text-primary" />
                            <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
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
                 <div className="flex w-1/3 justify-end">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
