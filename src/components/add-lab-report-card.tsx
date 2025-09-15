
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ClipboardPlus } from 'lucide-react';
import { AddLabReportForm } from './add-lab-report-form';
import { cn } from '@/lib/utils';

export function AddLabReportCard() {
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    if (isFormOpen) {
        return <AddLabReportForm onCancel={() => setIsFormOpen(false)} />;
    }

    return (
        <Card 
            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
            onClick={() => setIsFormOpen(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsFormOpen(true); }}
            role="button"
            tabIndex={0}
        >
            <CardHeader>
                <div className="flex items-center gap-4">
                    <ClipboardPlus className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Add New Lab Report</CardTitle>
                        <CardDescription>Enter multiple results from a single lab test.</CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
