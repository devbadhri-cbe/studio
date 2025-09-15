
'use client';

import { Logo } from '@/components/logo';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface TitleBarProps {
    title: string[];
    subtitle?: string | React.ReactNode;
    children?: React.ReactNode;
    rightChildren?: React.ReactNode;
    backButton?: React.ReactNode;
}

export function TitleBar({ title, subtitle, children, rightChildren, backButton }: TitleBarProps) {
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setIsScrolled(offset > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const renderTitle = () => {
        return title.map((word, index) => {
            if (word.toLowerCase() === 'lite') {
                return (
                    <Tooltip key={index}>
                        <TooltipTrigger asChild>
                            <span 
                                className="self-end text-sm font-sans font-normal text-muted-foreground animate-fade-in-down"
                                style={{ animationDelay: `${400 + index * 200}ms`, animationFillMode: 'both' }}
                            >
                                {word}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs text-center">
                                This Lite version has limited features. A full-featured version is planned for the future.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                );
            }
            return (
                 <span key={index} className="animate-fade-in-down" style={{ animationDelay: `${400 + index * 200}ms`, animationFillMode: 'both' }}>{word}</span>
            );
        });
    };

    return (
        <header className={cn(
            "sticky top-0 z-50 border-b transition-all duration-300",
            isScrolled 
                ? "bg-background/90 backdrop-blur-sm shadow-md border-border" 
                : "bg-background border-transparent",
            "px-4 md:px-6",
            isScrolled ? "py-2 md:py-3" : "pb-4 md:pb-6",
            "border-2 border-green-500"
        )}>
            <div className="mx-auto w-full max-w-7xl flex items-center justify-between pt-[env(safe-area-inset-top)]">
                 <div className="flex justify-start items-center gap-2 w-24">
                    {backButton || children}
                </div>
                <div className="flex-1 flex justify-center min-w-0">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2">
                            <Logo className={cn(
                                "text-primary transition-all duration-300",
                                isScrolled ? "h-8 w-8 md:h-8 md:w-8" : "h-14 w-14 md:h-10 md:w-10"
                            )} />
                            <div className={cn(
                                "flex items-baseline font-bold font-headline text-center md:flex-row md:gap-2 transition-all duration-300 text-shadow-3d",
                                isScrolled ? "text-2xl md:text-3xl" : "text-3xl md:text-5xl"
                            )}>
                                {renderTitle()}
                            </div>
                        </div>
                         <div className={cn(
                            "text-center text-xs text-muted-foreground mt-2 flex items-center gap-1 transition-all duration-300 animate-fade-in truncate",
                            isScrolled ? "opacity-0 h-0" : "opacity-100 h-auto"
                         )} style={{ animationDelay: '1300ms', animationFillMode: 'backwards' }}>
                           {subtitle && (typeof subtitle === 'string' ? <p className="truncate">{subtitle}</p> : subtitle)}
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
