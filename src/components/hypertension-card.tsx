
'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { UniversalCard } from './universal-card';
import { BloodPressureCard } from './blood-pressure-card';
import { Collapsible, CollapsibleContent } from './ui/collapsible';
import { cn } from '@/lib/utils';

export function HypertensionCard() {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <UniversalCard
                title="Hypertension Panel"
                icon={<Heart className="h-6 w-6 text-primary" />}
            >
                <CollapsibleContent>
                    <div className={cn("grid grid-cols-1 gap-6 transition-all")}>
                        <BloodPressureCard isReadOnly />
                    </div>
                </CollapsibleContent>
            </UniversalCard>
        </Collapsible>
    );
}
