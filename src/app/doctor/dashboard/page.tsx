
'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Mail, Phone } from 'lucide-react';

export default function DoctorDashboardPage() {
    const router = useRouter();
    const doctorName = 'Dr. Badhrinathan N';

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
       <header className="border-b px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold md:text-4xl font-headline">Health Guardian</span>
            </div>
             <div className="flex items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">{doctorName}</p>
                  <a href="mailto:drbadhri@gmail.com" className="flex items-center justify-end gap-1.5 hover:text-primary">
                    <Mail className="h-3 w-3" />
                    drbadhri@gmail.com
                  </a>
                  <a href="tel:+919791377716" className="flex items-center justify-end gap-1.5 hover:text-primary">
                    <Phone className="h-3 w-3" />
                    +91 9791377716
                  </a>
                </div>
                <Button variant="outline" onClick={() => router.push('/')}>View Patient Dashboard</Button>
            </div>
          </div>
        </header>
      <main className="flex flex-1 items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome, {doctorName}</h1>
          <p className="mt-2 text-muted-foreground">
            This is where you will manage your patients. This feature is under construction.
          </p>
        </div>
      </main>
    </div>
  );
}
