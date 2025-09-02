

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AnemiaCard } from './anemia-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { Hba1cCard } from './hba1c-card';
import { WeightRecordCard } from './weight-record-card';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';
import { TestTubeDiagonal } from 'lucide-react';

export function BiomarkersCard() {
    const { isDoctorLoggedIn } = useApp();
    
    const cards = React.useMemo(() => [
        { id: 'AnemiaCard', title: 'Anemia', component: <AnemiaCard /> },
        { id: 'FastingBloodGlucoseCard', title: 'Fasting Blood Glucose', component: <FastingBloodGlucoseCard /> },
        { id: 'Hba1cCard', title: 'HbA1c', component: <Hba1cCard /> },
        { id: 'WeightRecordCard', title: 'Weight Records', component: <WeightRecordCard /> },
    ].sort((a, b) => a.title.localeCompare(b.title)), []);
    
    const [activeCardId, setActiveCardId] = React.useState(cards[0].id);

    const activeIndex = cards.findIndex(c => c.id === activeCardId);

    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
                <div className='flex items-center gap-3 flex-1'>
                    <TestTubeDiagonal className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Key Biomarkers</h3>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="relative h-[480px]">
                    {cards.map((card, index) => {
                        const isActive = activeIndex === index;
                        const isBehind = index < activeIndex;

                        return (
                             <div
                                key={card.id}
                                className={cn(
                                    "absolute w-full h-full transition-all duration-300 ease-in-out",
                                    !isActive && "cursor-pointer"
                                )}
                                style={{
                                    transform: `translateY(${isActive ? 0 : isBehind ? -40 : (index - activeIndex) * 40}px)`,
                                    opacity: isBehind ? 0 : 1,
                                    zIndex: cards.length - index,
                                    clipPath: isActive ? 'inset(0 0 0 0)' : 'inset(0 0 calc(100% - 70px) 0)',
                                }}
                                onClick={() => !isActive && setActiveCardId(card.id)}
                            >
                                <div className={cn("w-full h-full")}>
                                     {!isActive && <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-20" />}
                                    {card.component}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
