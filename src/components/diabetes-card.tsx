
'use client';

import * as React from 'react';
import { Droplet } from 'lucide-react';
import { UniversalCard } from './universal-card';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from './ui/collapsible';

export function DiabetesCard() {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <UniversalCard
                title="Diabetes Panel"
                icon={<Droplet className="h-6 w-6 text-primary" />}
            >
                <CollapsibleContent>
                    <div className={cn(
                        "grid grid-cols-1 gap-6 transition-all",
                        "md:grid-cols-2"
                    )}>
                        <Hba1cCard isReadOnly />
                        <FastingBloodGlucoseCard isReadOnly />
                    </div>
                </CollapsibleContent>
            </UniversalCard>
        </Collapsible>
    );
}
