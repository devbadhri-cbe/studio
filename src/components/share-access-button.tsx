
'use client';

import * as React from 'react';
import { Patient } from '@/lib/types';
import { Button } from './ui/button';
import { Share2 } from 'lucide-react';
import { SharePatientAccessDialog } from './share-patient-access-dialog';

interface ShareAccessButtonProps {
    patient: Patient;
}

export function ShareAccessButton({ patient }: ShareAccessButtonProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <SharePatientAccessDialog patient={patient} open={open} onOpenChange={setOpen}>
            <Button variant="outline" onClick={() => setOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Access
            </Button>
        </SharePatientAccessDialog>
    )
}
