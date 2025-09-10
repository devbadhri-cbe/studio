
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const synopsisCardVariants = cva("mt-2 border-2", {
    variants: {
        variant: {
            default: "border-primary",
            destructive: "border-destructive",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

const synopsisIconVariants = cva("flex h-10 w-10 items-center justify-center rounded-lg", {
    variants: {
        variant: {
            default: "bg-primary/10",
            destructive: "bg-destructive/10",
        },
    },
    defaultVariants: {
        variant: "default",
    },
})

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
  variant?: "default" | "destructive";
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
  variant = 'default'
}: SynopsisCardLayoutProps) {
  return (
    <Card className={cn(synopsisCardVariants({ variant }))}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(synopsisIconVariants({ variant }))}>
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
           <Alert variant={variant === 'destructive' ? 'destructive' : 'default'} className="bg-transparent border-0 p-0">
            <AlertDescription className="whitespace-pre-wrap leading-relaxed px-1">
              {error || synopsis || 'No information available.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <div className="flex-1 w-full sm:w-auto">{footer}</div>
            <Button variant="ghost" size="sm" className="text-muted-foreground w-full sm:w-auto" onClick={onClose}>
                <XCircle className="mr-2 h-4 w-4" />
                Close
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
