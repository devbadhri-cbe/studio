'use client';

import { Logo } from '@/components/logo';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface TitleBarProps {
    title: string[];
    subtitle?: string;
    children?: React.ReactNode;
    rightChildren?: React.ReactNode;
    isScrolled: boolean;
}

export function TitleBar({ title, subtitle, children, rightChildren, isScrolled }: TitleBarProps) {
    
    const renderTitle = () => {
        if(title.length === 1) {
            return <span className="animate-fade-in-down" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>{title[0]}</span>
        }
        return title.map((word, index) => (
            <span key={index} className="animate-fade-in-down" style={{ animationDelay: `${400 + index * 200}ms`, animationFillMode: 'both' }}>{word}</span>
        ));
    };

    return (
        <header className={cn(
            "sticky top-0 z-50 border-b transition-all duration-300",
            isScrolled 
                ? "bg-background/90 backdrop-blur-sm shadow-md border-border" 
                : "bg-background border-transparent",
            "p-4 md:p-6",
            isScrolled && "py-2 md:py-3"
        )}>
            <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
                 <div className="flex justify-start items-center gap-2 w-24">
                    {children}
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2">
                            <Logo className={cn(
                                "text-primary transition-all duration-300",
                                isScrolled ? "h-8 w-8 md:h-8 md:w-8" : "h-14 w-14 md:h-10 md:w-10"
                            )} />
                            <div className={cn(
                                "flex flex-col font-bold font-headline text-center md:flex-row md:gap-2 text-shadow-3d transition-all duration-300",
                                isScrolled ? "text-xl md:text-2xl" : "text-2xl md:text-4xl"
                            )}>
                                {renderTitle()}
                            </div>
                        </div>
                         <div className={cn(
                            "text-center text-xs text-muted-foreground mt-2 flex items-center gap-1 transition-all duration-300",
                            isScrolled ? "opacity-0 h-0" : "opacity-100 h-auto"
                         )}>
                           {subtitle && (
                            <span 
                                className="hover:underline"
                            >
                                {subtitle}
                            </span>
                           )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end w-24">
                    {rightChildren}
                </div>
            </div>
        </header>
    );
}
