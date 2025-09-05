
'use client';

import * as React from 'react';
import { Settings, Droplet } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { useApp } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { HemoglobinCard } from './hemoglobin-card';

type Checked = DropdownMenuCheckboxItemProps["checked"]

export function DiabetesCard() {
  const { isDoctorLoggedIn } = useApp();
  const [showHbA1c, setShowHbA1c] = React.useState<Checked>(true);
  const [showFastingBloodGlucose, setShowFastingBloodGlucose] = React.useState<Checked>(true);
  const [showHemoglobin, setShowHemoglobin] = React.useState<Checked>(false);

  const visibleCards = [
      showHbA1c && <Hba1cCard key="hba1c" />,
      showFastingBloodGlucose && <FastingBloodGlucoseCard key="fbg" />,
      showHemoglobin && <HemoglobinCard key="hemoglobin" />,
  ].filter(Boolean);

  return (
    <Card className="h-full shadow-xl border-2 border-green-500">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-3 flex-1'>
                    <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold">Diabetes Panel</CardTitle>
                </div>
                {isDoctorLoggedIn && (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end">
                            <DropdownMenuLabel>Panel Components</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                            checked={showHbA1c}
                            onCheckedChange={setShowHbA1c}
                            >
                            HbA1c Card
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                            checked={showFastingBloodGlucose}
                            onCheckedChange={setShowFastingBloodGlucose}
                            >
                            Fasting Blood Glucose Card
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                            checked={showHemoglobin}
                            onCheckedChange={setShowHemoglobin}
                            >
                            Hemoglobin (Anemia) Card
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
             </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
             
             {visibleCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleCards}
                </div>
             ) : (
                <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                    <p className="text-center text-xs text-muted-foreground">No biomarker cards selected for this panel.</p>
                    {isDoctorLoggedIn && <p className="text-center text-xs text-muted-foreground mt-1">Click the <Settings className="inline-block h-3 w-3" /> icon to add cards.</p>}
                </div>
             )}
        </CardContent>
    </Card>
  );
}
