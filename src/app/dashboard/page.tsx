
'use client';

import { TitleBar } from '@/components/ui/title-bar';
import { PlusCircle, FileText, Droplet, Heart, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { BiomarkersPanel } from '@/components/biomarkers-panel';
import { DashboardSectionToggle } from '@/components/dashboard-section-toggle';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { DiabetesCard } from '@/components/diabetes-card';
import { HypertensionCard } from '@/components/hypertension-card';
import { LipidPanelCard } from '@/components/lipid-panel-card';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';


export default function HomeDashboard() {
  const router = useRouter();
  const { isClient } = useApp();
  const [biomarkerSearchQuery, setBiomarkerSearchQuery] = React.useState('');
  const [diseaseCardSearchQuery, setDiseaseCardSearchQuery] = React.useState('');
  
  const [isBiomarkersOpen, setIsBiomarkersOpen] = React.useState(false);
  const [isDiseaseCardsOpen, setIsDiseaseCardsOpen] = React.useState(false);

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <TitleBar
        title={['Health', 'Guardian', 'Lite']}
      />
      <main className="flex-1 px-4 md:px-6 pb-4">
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
          
            <Collapsible open={isDiseaseCardsOpen} onOpenChange={setIsDiseaseCardsOpen}>
                <DashboardSectionToggle
                    title="Disease Cards Collection"
                    subtitle="Manage high-level disease-specific cards"
                    icon={<Heart className="h-6 w-6 text-primary" />}
                    isOpen={isDiseaseCardsOpen}
                    searchQuery={diseaseCardSearchQuery}
                    onSearchChange={setDiseaseCardSearchQuery}
                    searchPlaceholder="Search disease cards..."
                />
                <CollapsibleContent>
                    <Card>
                        <CardContent className="p-4">
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                <div className="space-y-4">
                                    <DiabetesCard />
                                    <HypertensionCard />
                                    <LipidPanelCard />
                                </div>
                             </Accordion>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible open={isBiomarkersOpen} onOpenChange={setIsBiomarkersOpen}>
                <DashboardSectionToggle
                    title="Biomarker Cards Collection"
                    subtitle="View and manage the complete collection of biomarker cards"
                    icon={<Droplet className="h-6 w-6 text-primary" />}
                    isOpen={isBiomarkersOpen}
                    searchQuery={biomarkerSearchQuery}
                    onSearchChange={setBiomarkerSearchQuery}
                    searchPlaceholder="Search biomarkers..."
                />
                <CollapsibleContent>
                    <BiomarkersPanel searchQuery={biomarkerSearchQuery}/>
                </CollapsibleContent>
            </Collapsible>
        </div>
      </main>
    </div>
  );
}
