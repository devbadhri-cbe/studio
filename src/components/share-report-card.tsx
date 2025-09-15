
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Share2 } from 'lucide-react';
import { ShareReportOptions } from './share-report-options';

export function ShareReportCard() {
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    if (isFormOpen) {
        return <ShareReportOptions onCancel={() => setIsFormOpen(false)} />;
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
                    <Share2 className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Share Health Report</CardTitle>
                        <CardDescription>Generate a QR code or a printable summary.</CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
