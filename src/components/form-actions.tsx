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
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>
                {cancelText}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitText}
            </Button>
        </div>
    );
}
