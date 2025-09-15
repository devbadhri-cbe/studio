
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Copy, Printer, XCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Separator } from './ui/separator';

interface ShareReportOptionsProps {
    onCancel: () => void;
}

export function ShareReportOptions({ onCancel }: ShareReportOptionsProps) {
    const [reportUrl, setReportUrl] = React.useState('');
    const { toast } = useToast();
    const router = useRouter();

    React.useEffect(() => {
        // This ensures window is defined, so it only runs on the client.
        setReportUrl(`${window.location.origin}/patient/report`);
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(reportUrl)
            .then(() => {
                toast({ title: 'Link Copied!', description: 'The report link has been copied to your clipboard.' });
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy link to clipboard.' });
            });
    };
    
    const handlePrint = () => {
        router.push('/patient/report');
    };

    return (
        <Card className="border-primary border-2">
            <CardHeader>
                <CardTitle>Share Health Report</CardTitle>
                <CardDescription>Share a link to a read-only version of your report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-center bg-white p-4 rounded-md shadow-inner">
                    {reportUrl ? (
                         <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "160px" }}
                            value={reportUrl}
                            viewBox={`0 0 256 256`}
                        />
                    ) : (
                        <div className="h-[160px] w-[160px] bg-gray-200 animate-pulse rounded-md" />
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleCopyLink}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Sharable Link
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Generate & Print Report
                    </Button>
                </div>
                <Separator />
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={onCancel}>
                         <XCircle className="mr-2 h-4 w-4" />
                        Close
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
