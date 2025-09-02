
'use client';

import * as React from 'react';
import { Settings, Droplet } from 'lucide-react';
import { BiomarkerCardTemplate } from './biomarker-card-template';
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
import { Card, CardContent } from './ui/card';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { AnemiaCard } from './anemia-card';
import { WeightRecordCard } from './weight-record-card';

type Checked = DropdownMenuCheckboxItemProps["checked"]

export function DiabetesCard() {
  const { isDoctorLoggedIn } = useApp();
  const [showHbA1c, setShowHbA1c] = React.useState<Checked>(true);
  const [showFastingBloodGlucose, setShowFastingBloodGlucose] = React.useState<Checked>(true);
  const [showAnemia, setShowAnemia] = React.useState<Checked>(false);
  const [showWeight, setShowWeight] = React.useState<Checked>(false);

  return (
    <Card className="h-full">
        <CardContent className="p-4 space-y-4">
             <div className="flex items-center justify-between">
                <div className='flex items-center gap-3 flex-1'>
                    <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Diabetes Panel</h3>
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
                            checked={showAnemia}
                            onCheckedChange={setShowAnemia}
                            >
                            Anemia Card
                            </DropdownMenuCheckboxItem>
                             <DropdownMenuCheckboxItem
                            checked={showWeight}
                            onCheckedChange={setShowWeight}
                            >
                            Weight Card
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
             </div>
             
             <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                <p className="text-center text-xs text-muted-foreground">No biomarker cards selected for this panel.</p>
                 {isDoctorLoggedIn && <p className="text-center text-xs text-muted-foreground mt-1">Click the <Settings className="inline-block h-3 w-3" /> icon to add cards.</p>}
            </div>

        </CardContent>
    </Card>
  );
}
