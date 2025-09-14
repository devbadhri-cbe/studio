
'use client';

import * as React from 'react';
import { HeartCrack } from 'lucide-react'; // Using HeartCrack as a placeholder
import { UniversalCard } from './universal-card';
import { HemoglobinCard } from './hemoglobin-card';
import { Collapsible, CollapsibleContent } from './ui/collapsible';
import { cn } from '@/lib/utils';

export function AnemiaCard() {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <UniversalCard
                title="Anemia Card"
                icon={<HeartCrack className="h-6 w-6 text-primary" />}
            >
                <CollapsibleContent>
                    <div className={cn("grid grid-cols-1 gap-6 transition-all")}>
                        <HemoglobinCard isReadOnly />
                    </div>
                </CollapsibleContent>
            </UniversalCard>
        </Collapsible>
    );
}
