

'use client';

import * as React from 'react';
import { WeightRecordCard } from './weight-record-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shapes, Settings, PlusCircle } from 'lucide-react';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { AnemiaCard } from './anemia-card';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from './ui/input';
import { useApp } from '@/context/app-context';
import { CreateBiomarkerDialog } from './create-biomarker-dialog';
import { Separator } from './ui/separator';

type ActiveView = 'anemia' | 'glucose' | 'weight' | string;

const biomarkerCardMap: Record<string, { label: string; component: React.FC }> = {
  anemia: { label: 'Hemoglobin', component: AnemiaCard },
  glucose: { label: 'Fasting Blood Glucose', component: FastingBloodGlucoseCard },
  weight: { label: 'Weight & BMI', component: WeightRecordCard },
};

export function BiomarkersCard() {
  const { customBiomarkers, profile } = useApp();
  
  const [activeView, setActiveView] = React.useState<ActiveView>('weight');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const availableBiomarkerOptions = React.useMemo(() => {
    return Object.keys(biomarkerCardMap)
      .map(key => ({ value: key as ActiveView, label: biomarkerCardMap[key].label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  React.useEffect(() => {
    if (availableBiomarkerOptions.length > 0) {
      setActiveView(availableBiomarkerOptions[0].value);
    }
  }, [availableBiomarkerOptions]);


  const renderActiveCard = () => {
    const cardInfo = biomarkerCardMap[activeView];
    if (cardInfo) {
      const CardComponent = cardInfo.component;
      return <CardComponent />;
    }
    return <WeightRecordCard />; // Default fallback
  };

  const filteredOptions = availableBiomarkerOptions.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectOption = (view: ActiveView) => {
    setActiveView(view);
    setIsPopoverOpen(false);
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    setIsPopoverOpen(false);
    setIsCreateDialogOpen(true);
  }

  return (
    <>
      <Card className="h-auto flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shapes className="h-5 w-5 shrink-0 text-muted-foreground" />
            <CardTitle>Key Biomarkers</CardTitle>
          </div>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
              <div className="flex flex-col space-y-2">
                <Input
                  placeholder="Search biomarkers..."
                  className="h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                 <div className="max-h-60 overflow-y-auto">
                    <div className="flex flex-col space-y-1">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => handleSelectOption(option.value as ActiveView)}
                          >
                            {option.label}
                          </Button>
                        ))
                      ) : (
                        <p className="text-center text-xs text-muted-foreground py-2">
                          No results found.
                        </p>
                      )}
                    </div>
                </div>
                <Separator />
                 <Button variant="ghost" className="w-full justify-start" onClick={handleCreateNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New...
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-1 flex flex-col">
          {renderActiveCard()}
        </CardContent>
      </Card>
      <CreateBiomarkerDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </>
  );
}
