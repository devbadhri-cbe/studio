'use client';

import { Logo } from '@/components/logo';
import { Mail, LogOut } from 'lucide-react';
import * as React from 'react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface TitleBarProps {
    doctorName: string;
    doctorEmail: string;
    children?: React.ReactNode;
}

export function TitleBar({ doctorName, doctorEmail, children }: TitleBarProps) {
    const { setDoctor } = useApp();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignOut = async () => {
        setDoctor(null);
        toast({
            title: 'Signed Out',
            description: 'You have been successfully signed out.',
        });
        router.push('/doctor/login');
    };

    return (
        <header className="border-b px-4 py-6 md:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 relative">
                 <div className="absolute top-0 right-0 flex items-center gap-2">
                    <ThemeToggle />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sign Out</TooltipContent>
                    </Tooltip>
                </div>
                 {children}
                <div className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                    <p className="font-semibold text-lg text-foreground">{doctorName}</p>
                    <a href={`mailto:${doctorEmail}`} className="flex items-center justify-center gap-1.5 hover:text-primary">
                        <Mail className="h-3 w-3" />
                        {doctorEmail}
                    </a>
                </div>
            </div>
        </header>
    );
}
