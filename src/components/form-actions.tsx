'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <div className={cn("flex flex-col justify-end gap-2 pt-4 border-2 border-green-500 p-2 rounded-md")}>
            <Button type="button" variant="ghost" onClick={onCancel} className="w-full border-2 border-red-500">
                {cancelText}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full border-2 border-blue-500">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitText}
            </Button>
        </div>
    );
}
