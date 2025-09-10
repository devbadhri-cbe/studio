
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { AddNewBiomarker } from './add-new-biomarker';
import { Card, CardContent } from './ui/card';

export function AddBiomarkerCard() {
    const [isAdding, setIsAdding] = React.useState(false);

    if (isAdding) {
        return <AddNewBiomarker onCancel={() => setIsAdding(false)} />;
    }

    return (
        <Card className="border-2 border-dashed bg-muted/20 hover:bg-muted/50 transition-colors">
            <CardContent className="p-0">
                <Button
                    variant="ghost"
                    className="w-full h-full justify-center items-center py-8"
                    onClick={() => setIsAdding(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Biomarker
                </Button>
            </CardContent>
        </Card>
    );
}
