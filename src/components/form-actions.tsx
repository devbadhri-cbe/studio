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
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
                {cancelText}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitText}
            </Button>
        </div>
    );
}
