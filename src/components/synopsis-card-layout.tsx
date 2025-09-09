'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

interface SynopsisCardLayoutProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isLoading: boolean;
  isTranslating?: boolean;
  error: string | null;
  synopsis: string | null;
  footer: React.ReactNode;
  onClose: () => void;
}

export function SynopsisCardLayout({
  icon,
  title,
  description,
  isLoading,
  isTranslating,
  error,
  synopsis,
  footer,
  onClose,
}: SynopsisCardLayoutProps) {
  return (
    <Card className="mt-2 border-2 border-primary">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Separator className="mb-6" />
        {(isLoading || isTranslating) && (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{isTranslating ? 'Translating...' : 'Loading...'}</p>
          </div>
        )}

        {!isLoading && !isTranslating && (
          <Alert>
            <AlertDescription className="whitespace-pre-wrap leading-relaxed">
              {error || synopsis || 'No information available.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center gap-2 pt-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onClose}>
            <XCircle className="mr-2 h-4 w-4" />
            Close
          </Button>
          {footer}
        </div>
      </CardContent>
    </Card>
  );
}
