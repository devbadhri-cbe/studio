
'use client';

import * as React from 'react';
import { PlusCircle } from 'lucide-react';
import { AddNewBiomarker } from './add-new-biomarker';
import { DashboardSectionToggle } from './dashboard-section-toggle';

export function AddBiomarkerCard() {
    const [isAdding, setIsAdding] = React.useState(false);

    if (isAdding) {
        return <AddNewBiomarker onCancel={() => setIsAdding(false)} />;
    }

    return (
        <div role="button" onClick={() => setIsAdding(true)} className="w-full">
            <DashboardSectionToggle
                title="Create New Biomarker"
                subtitle="Define a new biomarker to track in the dashboard"
                icon={<PlusCircle className="h-6 w-6 text-primary" />}
                isOpen={false}
                searchQuery=""
                onSearchChange={() => {}}
                searchPlaceholder=""
                isCollapsible={false}
            />
        </div>
    );
}
