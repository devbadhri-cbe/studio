'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
    onCancel: () => void;
    isSubmitting: boolean;
    submitText?: string;
    cancelText?: string;
}

export function FormActions({
    onCancel,
    isSubmitting,
    submitText = 'Save',
    cancelText = 'Cancel'
}: FormActionsProps) {
    return (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border border-green-500 p-2 rounded-md">
            <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto border border-destructive">
                {cancelText}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto border border-accent">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitText}
            </Button>
        </div>
    );
}
