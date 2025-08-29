
'use client';

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { useApp } from '@/context/app-context';
import { countries } from '@/lib/countries';

export function useDateFormatter() {
  const { profile } = useApp();

  const dateFormat = React.useMemo(() => {
    return countries.find(c => c.code === profile.country)?.dateFormat || 'MM-dd-yyyy';
  }, [profile.country]);

  const formatDate = React.useCallback((date: string | Date): string => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, dateFormat);
    } catch (error) {
        console.error("Invalid date for formatting:", date);
        return 'Invalid Date';
    }
  }, [dateFormat]);

  return formatDate;
}
