
'use client';

import { Logo } from '@/components/logo';
import * as React from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { doctorDetails } from '@/lib/doctor-data';
import { Button } from './button';
import { Edit } from 'lucide-react';
import { EditDoctorDetailsDialog } from '../edit-doctor-details-dialog';

interface TitleBarProps {
    children?: React.ReactNode;
    backButton?: React.ReactNode;
}

export function TitleBar({ children, backButton }: TitleBarProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    
    return (
        <>
        <header className="border-b p-4 md:p-6">
            <div className="mx-auto w-full max-w-7xl flex items-center justify-between border border-red-500">
                 <div className="flex justify-start items-center gap-2 w-24 border border-red-500">
                    {backButton || children}
                </div>
                <div className="flex-1 flex justify-center border border-red-500">
                    <div className="flex flex-col items-center border border-red-500">
                        <div className="flex items-center justify-center gap-2 border border-red-500">
                            <Logo className="h-14 w-14 text-primary md:h-10 md:w-10 animate-fade-in-scale" style={{ animationDelay: '200ms', animationFillMode: 'both' }} />
                            <div className="flex flex-col text-2xl md:text-4xl font-bold font-headline text-center md:flex-row md:gap-2 border border-red-500">
                                <span className="animate-fade-in-down" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>Health</span>
                                <span className="animate-fade-in-down" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>Guardian</span>
                            </div>
                        </div>
                         <div className="text-center text-xs text-muted-foreground mt-2 flex items-center gap-1 border border-red-500">
                           <a href={`mailto:${doctorDetails.developerEmail}`} className="hover:underline">{doctorDetails.name}</a>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end w-24 border border-red-500">
                    <ThemeToggle />
                </div>
            </div>
        </header>
         <EditDoctorDetailsDialog open={isEditing} onOpenChange={setIsEditing} />
        </>
    );
}
