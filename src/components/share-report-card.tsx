
'use client';

import * as React from 'react';
import { Share2 } from 'lucide-react';
import { ShareReportOptions } from './share-report-options';
import { DashboardSectionToggle } from './dashboard-section-toggle';

export function ShareReportCard() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <DashboardSectionToggle
            title="Share Health Report"
            subtitle="Generate a QR code or a printable summary."
            icon={<Share2 className="h-6 w-6 text-primary" />}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
        >
            <ShareReportOptions onCancel={() => setIsOpen(false)} />
        </DashboardSectionToggle>
    );
}
