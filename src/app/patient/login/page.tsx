
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function PatientLoginPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex items-center justify-center gap-2 mb-4">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-headline">Health Guardian</span>
            </div>
          <CardTitle className="text-2xl">Patient Portal</CardTitle>
          <CardDescription>Patient access is temporarily disabled for maintenance. Please check back later.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
             <Link href="/doctor/dashboard" className="text-sm text-muted-foreground hover:text-primary">
                Are you a doctor? Log in here.
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
