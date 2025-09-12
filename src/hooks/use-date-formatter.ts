'use client';

import * as React from 'react';
import { format as formatDateFns, parseISO, isValid } from 'date-fns';
import { useApp } from '@/context/app-context';

export function useDateFormatter() {
  const { profile } = useApp();
  
  // Default to a common format if profile isn't loaded or doesn't have the setting
  const dateFormat = profile?.dateFormat || 'MM-dd-yyyy';

  const formatDate = React.useCallback((date: string | Date): string => {
    if (!date) return 'Invalid Date';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) {
            console.error("Invalid date provided to formatDate:", date);
            return 'Invalid Date';
        }
        // Use 'PPP' for the "Month D, YYYY" format, otherwise use the stored format string
        return formatDateFns(dateObj, dateFormat === 'PPP' ? 'PPP' : dateFormat);
    } catch (error) {
        console.error("Error formatting date:", date, error);
        return 'Invalid Date';
    }
  }, [dateFormat]);

  return formatDate;
}
