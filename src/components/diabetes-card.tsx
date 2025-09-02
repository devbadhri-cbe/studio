
'use client';

import * as React from 'react';
import { Settings, Droplet, Check } from 'lucide-react';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { Label } from './ui/label';

type Checked = DropdownMenuCheckboxItemProps["checked"]

export function DiabetesCard() {
  const [showHbA1c, setShowHbA1c] = React.useState<Checked>(true)
  const [showFastingBloodGlucose, setShowFastingBloodGlucose] = React.useState<Checked>(true)
  const [showAnemia, setShowAnemia] = React.useState<Checked>(false)

  const Title = 'Diabetes Panel';
  const Icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = (
    <Popover>
        <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
              </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                  <Label className="font-semibold">Panel Components</Label>
                  <div className="space-y-1">
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
                  </div>
              </div>
        </PopoverContent>
    </Popover>
  );

  const RecordsList = (
    <div className="flex h-full items-center justify-center">
      <p className="text-xs text-muted-foreground text-center">Biomarker cards will be shown here based on selection.</p>
    </div>
  );

  const StatusDisplay = (
    <div className="flex flex-col items-center justify-center flex-1">
       <p className="text-xs text-muted-foreground text-center">Overall status will be shown here.</p>
    </div>
  );

  const Chart = (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
        <p className="text-center text-xs text-muted-foreground">Charts for selected biomarkers will appear here.</p>
    </div>
  );
  
  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      recordsList={RecordsList}
      statusDisplay={StatusDisplay}
      chart={Chart}
    />
  );
}
