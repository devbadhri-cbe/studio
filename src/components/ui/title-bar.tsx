
'use client';

import { Logo } from '@/components/logo';
import * as React from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useApp } from '@/context/app-context';
import { Button } from './button';
import { Edit } from 'lucide-react';
import { EditDoctorDetailsDialog } from '@/components/edit-doctor-details-dialog';

interface TitleBarProps {
    children?: React.ReactNode;
}

export function TitleBar({ children }: TitleBarProps) {
    const { isDoctorLoggedIn, profile } = useApp();
    const [isEditing, setIsEditing] = React.useState(false);
    
    return (
        <>
        <header className="border-b px-4 py-2 md:px-6">
            <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
                 <div className="flex justify-start items-center gap-2 w-24">
                    {children}
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2">
                            <Logo className="h-14 w-14 text-primary md:h-10 md:w-10 animate-fade-in-scale" style={{ animationDelay: '200ms', animationFillMode: 'both' }} />
                            <div className="flex flex-col text-2xl md:text-4xl font-bold font-headline text-center md:flex-row md:gap-2">
                                <span className="animate-fade-in-down" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>Health</span>
                                <span className="animate-fade-in-down" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>Guardian</span>
                            </div>
                        </div>
                         <div className="text-center text-xs text-muted-foreground mt-2 flex items-center gap-1">
                           {(profile.doctorName) || 'Your Health Partner'}
                           {isDoctorLoggedIn && (
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                                <Edit className="h-3 w-3" />
                            </Button>
                           )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end w-24">
                    <ThemeToggle />
                </div>
            </div>
        </header>
        <EditDoctorDetailsDialog open={isEditing} onOpenChange={setIsEditing} />
        </>
    );
}
