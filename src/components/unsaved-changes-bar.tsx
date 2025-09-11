

'use client';

import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Save, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UnsavedChangesBar() {
  const { hasUnsavedChanges, saveChanges, isSaving } = useApp();

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300',
        hasUnsavedChanges ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="bg-background/95 backdrop-blur-sm p-4 border-t shadow-lg pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
             <Info className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">You have unsaved changes.</p>
          </div>
          <Button
            onClick={saveChanges}
            disabled={isSaving}
            size="sm"
            className="text-destructive-foreground bg-primary hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            <span className="font-bold">
                {isSaving ? 'Saving...' : 'Save Changes'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
