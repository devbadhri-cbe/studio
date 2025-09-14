
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
import { mockPatients } from '@/lib/mock-patients';
import { PatientCard } from '@/components/patient-card';
import type { Patient } from '@/lib/types';


export default function HomeDashboard() {
  const router = useRouter();
  const { isClient, setPatientData } = useApp();
  const [biomarkerSearchQuery, setBiomarkerSearchQuery] = React.useState('');
  const [diseaseCardSearchQuery, setDiseaseCardSearchQuery] = React.useState('');
  const [patientSearchQuery, setPatientSearchQuery] = React.useState('');
  
  const [isBiomarkersOpen, setIsBiomarkersOpen] = React.useState(true);
  const [isDiseaseCardsOpen, setIsDiseaseCardsOpen] = React.useState(true);
  const [isPatientPanelOpen, setIsPatientPanelOpen] = React.useState(true);

  if (!isClient) {
    return null; // or a loading skeleton
  }
  
  const handleViewPatient = (patient: Patient) => {
    setPatientData(patient, true);
    router.push('/patient/dashboard');
  };

  const filteredPatients = mockPatients.filter(p => p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()));

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <TitleBar
        title={['Health', 'Guardian', 'Lite']}
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

            <Collapsible open={isPatientPanelOpen} onOpenChange={setIsPatientPanelOpen}>
                <DashboardSectionToggle
                    title="Patient Management"
                    subtitle="Select a mock patient to view their dashboard"
                    icon={<Users className="h-6 w-6 text-primary" />}
                    isOpen={isPatientPanelOpen}
                    searchQuery={patientSearchQuery}
                    onSearchChange={setPatientSearchQuery}
                    searchPlaceholder="Search patients..."
                />
                 <CollapsibleContent>
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredPatients.map(p => (
                                    <PatientCard 
                                        key={p.id}
                                        patient={p}
                                        onView={handleViewPatient}
                                        onEdit={() => {}}
                                        onDelete={() => {}}
                                    />
                                ))}
                            </div>
                            {filteredPatients.length === 0 && (
                                <div className="text-center text-muted-foreground py-12">
                                    <p>No patients match your search.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 </CollapsibleContent>
            </Collapsible>
          
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <DiabetesCard />
                                <HypertensionCard />
                                <div className="lg:col-span-2">
                                    <LipidPanelCard />
                                </div>
                            </div>
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
