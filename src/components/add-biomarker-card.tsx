
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { AddNewBiomarker } from './add-new-biomarker';

export function AddBiomarkerCard() {
    const [isAdding, setIsAdding] = React.useState(false);

    if (isAdding) {
        return <AddNewBiomarker onCancel={() => setIsAdding(false)} />;
    }

    return (
        <Card className="border-2 border-dashed">
            <CardContent className="p-4">
                <Button variant="ghost" className="w-full h-full" onClick={() => setIsAdding(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Biomarker
                </Button>
            </CardContent>
        </Card>
    );
}
