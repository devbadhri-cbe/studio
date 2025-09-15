
'use client';

import * as React from 'react';
import { ClipboardPlus } from 'lucide-react';
import { AddLabReportForm } from './add-lab-report-form';
import { DashboardSectionToggle } from './dashboard-section-toggle';

export function AddLabReportCard() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <DashboardSectionToggle
            title="Add New Lab Report"
            subtitle="Enter multiple results from a single lab test."
            icon={<ClipboardPlus className="h-6 w-6 text-primary" />}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
        >
            <AddLabReportForm onCancel={() => setIsOpen(false)} />
        </DashboardSectionToggle>
    );
}
