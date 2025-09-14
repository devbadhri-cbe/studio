
'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { UniversalCard } from './universal-card';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from './ui/collapsible';
import { TotalCholesterolCard } from './total-cholesterol-card';
import { LdlCard } from './ldl-card';
import { HdlCard } from './hdl-card';
import { TriglyceridesCard } from './triglycerides-card';


export function LipidPanelCard() {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <UniversalCard
                title="Lipid Card"
                icon={<Flame className="h-6 w-6 text-primary" />}
            >
                <CollapsibleContent>
                    <div className={cn(
                        "grid grid-cols-1 gap-6 transition-all",
                        "md:grid-cols-2"
                    )}>
                        <TotalCholesterolCard isReadOnly={true} />
                        <LdlCard isReadOnly={true} />
                        <HdlCard isReadOnly={true} />
                        <TriglyceridesCard isReadOnly={true} />
                    </div>
                </CollapsibleContent>
            </UniversalCard>
        </Collapsible>
    );
}
