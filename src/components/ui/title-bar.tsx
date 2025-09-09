
'use client';

import { Logo } from '@/components/logo';
import * as React from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from './button';
import { Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TitleBarProps {
    title: string[];
    subtitle?: string;
    onSubtitleClick?: () => void;
    children?: React.ReactNode;
    backButton?: React.ReactNode;
}

export function TitleBar({ title, subtitle, onSubtitleClick, children, backButton }: TitleBarProps) {
    
    const renderTitle = () => {
        if(title.length === 1) {
            return <span className="animate-fade-in-down" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>{title[0]}</span>
        }
        return title.map((word, index) => (
            <span key={index} className="animate-fade-in-down" style={{ animationDelay: `${400 + index * 200}ms`, animationFillMode: 'both' }}>{word}</span>
        ));
    };

    return (
        <header className="border-b p-4 md:p-6">
            <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
                 <div className="flex justify-start items-center gap-2 w-24">
                    {backButton || children}
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2">
                            <Logo className="h-14 w-14 text-primary md:h-10 md:w-10 animate-fade-in-scale" style={{ animationDelay: '200ms', animationFillMode: 'both' }} />
                            <div className="flex flex-col text-2xl md:text-4xl font-bold font-headline text-center md:flex-row md:gap-2 text-shadow-3d">
                                {renderTitle()}
                            </div>
                        </div>
                        {subtitle && (
                             <div className="text-center text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <button onClick={onSubtitleClick} className={cn("hover:underline", onSubtitleClick && "cursor-pointer")}>{subtitle}</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end w-24">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
