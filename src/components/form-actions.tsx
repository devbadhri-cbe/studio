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
        <div className="flex flex-col gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitText}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
                {cancelText}
            </Button>
        </div>
    );
}
