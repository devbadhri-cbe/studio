

'use client';

import * as React from 'react';
import { WeightRecordCard } from './weight-record-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shapes, Settings } from 'lucide-react';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { AnemiaCard } from './anemia-card';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from './ui/input';

type ActiveView = 'anemia' | 'glucose' | 'weight';

const biomarkerOptions: { value: ActiveView; label: string }[] = [
  { value: 'anemia', label: 'Hemoglobin' },
  { value: 'glucose', label: 'Fasting Blood Glucose' },
  { value: 'weight', label: 'Weight & BMI' },
];

// Sort alphabetically by label
biomarkerOptions.sort((a, b) => a.label.localeCompare(b.label));

export function BiomarkersCard() {
  const [activeView, setActiveView] = React.useState<ActiveView>('weight');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const renderActiveCard = () => {
    switch (activeView) {
      case 'glucose':
        return <FastingBloodGlucoseCard />;
      case 'anemia':
        return <AnemiaCard />;
      case 'weight':
      default:
        return <WeightRecordCard />;
    }
  };

  const filteredOptions = biomarkerOptions.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectOption = (view: ActiveView) => {
    setActiveView(view);
    setIsPopoverOpen(false);
    setSearchQuery('');
  };

  return (
    <Card className="h-auto md:row-span-2 flex flex-col">
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
              <div className="flex flex-col space-y-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleSelectOption(option.value)}
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
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        {renderActiveCard()}
      </CardContent>
    </Card>
  );
}
