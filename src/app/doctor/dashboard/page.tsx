'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DoctorDashboardPage() {
    const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
       <header className="border-b px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
            </div>
             <div className="flex items-center gap-4">
                <p className='text-lg font-semibold'>Doctor's Dashboard</p>
                <Button variant="outline" onClick={() => router.push('/')}>View Patient Dashboard</Button>
            </div>
          </div>
        </header>
      <main className="flex flex-1 items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome, Doctor</h1>
          <p className="mt-2 text-muted-foreground">
            This is where you will manage your patients. This feature is under construction.
          </p>
        </div>
      </main>
    </div>
  );
}
