
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { ClipboardPlus } from 'lucide-react';
import { AddLabReportDialog } from './add-lab-report-dialog';

export function AddLabReportCard() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    return (
        <>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <ClipboardPlus className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle>Add New Lab Report</CardTitle>
                            <CardDescription>Enter multiple results from a single lab test.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
                        <ClipboardPlus className="mr-2 h-4 w-4" />
                        Add Full Lab Report
                    </Button>
                </CardContent>
            </Card>
            {isDialogOpen && <AddLabReportDialog onCancel={() => setIsDialogOpen(false)} />}
        </>
    );
}
