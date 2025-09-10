
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';

interface AddNewBiomarkerProps {
    onCancel: () => void;
}

export function AddNewBiomarker({ onCancel }: AddNewBiomarkerProps) {
    const [biomarkerName, setBiomarkerName] = React.useState('');
    const [isCreating, setIsCreating] = React.useState(false);

    const handleCreate = () => {
        // Placeholder for creation logic
        setIsCreating(true);
        console.log("Creating biomarker:", biomarkerName);
        setTimeout(() => {
            setIsCreating(false);
            onCancel(); // Close form after "creation"
        }, 1500);
    };

    return (
        <Card className="border-primary border-2 mb-4">
            <CardHeader>
                <CardTitle>Create New Biomarker</CardTitle>
                <CardDescription>
                    Define a new biomarker to track. This will generate the necessary card, chart, and dialogs.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="biomarkerName">Biomarker Name</Label>
                    <Input
                        id="biomarkerName"
                        placeholder="e.g., Uric Acid"
                        value={biomarkerName}
                        onChange={(e) => setBiomarkerName(e.target.value)}
                    />
                </div>
                {/* More fields for units, ranges, etc. would go here */}
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isCreating || !biomarkerName}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
