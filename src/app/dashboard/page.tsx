
'use client';

import { TitleBar } from '@/components/ui/title-bar';
import { PlusCircle, FileText, Droplet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { BiomarkersPanel } from '@/components/biomarkers-panel';
import { AddNewBiomarker } from '@/components/add-new-biomarker';
import { DashboardSectionToggle } from '@/components/dashboard-section-toggle';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

export default function HomeDashboard() {
  const router = useRouter();
  const { isClient } = useApp();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isAddingBiomarker, setIsAddingBiomarker] = React.useState(false);
  const [biomarkerSearchQuery, setBiomarkerSearchQuery] = React.useState('');
  const [isBiomarkersOpen, setIsBiomarkersOpen] = React.useState(true);


  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <TitleBar
        title={['Developer', 'Dashboard']}
        isScrolled={isScrolled}
      />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto grid w-full max-w-7xl gap-6">
           <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4" />
              <AlertTitle>Welcome, Developer!</AlertTitle>
              <AlertDescription>
                This is your developer dashboard. You can view all biomarkers, create new ones, and navigate to the patient view. The patient view will not contain any of these developer tools.
              </AlertDescription>
            </Alert>
            <div className="flex items-center justify-between">
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/project-plan.html', '_blank')}
                    >
                    <FileText className="mr-2 h-4 w-4" />
                    Project Plan
                </Button>
                <Button size="sm" onClick={() => router.push('/patient/dashboard')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Go to Patient View
                </Button>
          </div>
          
            <Collapsible open={isBiomarkersOpen} onOpenChange={setIsBiomarkersOpen}>
                <DashboardSectionToggle
                    title="All Biomarkers"
                    subtitle="View and manage the complete collection of biomarker cards"
                    icon={<Droplet className="h-6 w-6 text-primary" />}
                    isOpen={isBiomarkersOpen}
                    searchQuery={biomarkerSearchQuery}
                    onSearchChange={setBiomarkerSearchQuery}
                    searchPlaceholder="Search biomarkers..."
                    showCreateButton={true}
                    onCreateClick={() => setIsAddingBiomarker(!isAddingBiomarker)}
                />
                <CollapsibleContent>
                    {isAddingBiomarker && <AddNewBiomarker onCancel={() => setIsAddingBiomarker(false)} />}
                    <BiomarkersPanel searchQuery={biomarkerSearchQuery}/>
                </CollapsibleContent>
            </Collapsible>

        </div>
      </main>
    </div>
  );
}
