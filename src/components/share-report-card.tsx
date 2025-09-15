
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ShareReportCard() {
    const router = useRouter();

    const handleShare = () => {
        router.push('/patient/report');
    };

    return (
        <Card 
            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
            onClick={handleShare}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleShare(); }}
            role="button"
            tabIndex={0}
        >
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Share2 className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Share Health Report</CardTitle>
                        <CardDescription>Generate a printable summary of your health data.</CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
