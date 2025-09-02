

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AnemiaCard } from './anemia-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { Hba1cCard } from './hba1c-card';
import { WeightRecordCard } from './weight-record-card';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';
import { Droplet, Weight, TestTubeDiagonal } from 'lucide-react';

export function BiomarkersCard() {
    const { isDoctorLoggedIn } = useApp();
    const [activeCard, setActiveCard] = React.useState('AnemiaCard');

    const cards = React.useMemo(() => [
        { id: 'AnemiaCard', title: 'Anemia', component: <AnemiaCard /> },
        { id: 'FastingBloodGlucoseCard', title: 'Fasting Blood Glucose', component: <FastingBloodGlucoseCard /> },
        { id: 'Hba1cCard', title: 'HbA1c', component: <Hba1cCard /> },
        { id: 'WeightRecordCard', title: 'Weight Records', component: <WeightRecordCard /> },
    ].sort((a, b) => a.title.localeCompare(b.title)), []);

    const activeIndex = cards.findIndex(c => c.id === activeCard);

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
                        const isBehind = activeIndex > index;
                        
                        return (
                             <div
                                key={card.id}
                                className={cn(
                                    "absolute w-full h-full transition-all duration-300 ease-in-out",
                                    isActive ? 'z-10' : 'z-0',
                                    !isActive && (isBehind ? 'opacity-0 scale-90 -translate-y-4' : 'opacity-100')
                                )}
                                style={{
                                    transform: `translateY(${(index - activeIndex) * 20}px) scale(${1 - (activeIndex - index) * 0.05})`,
                                    zIndex: cards.length - Math.abs(activeIndex - index),
                                }}
                            >
                                <div
                                    className={cn(
                                        "w-full h-full",
                                        !isActive && "cursor-pointer"
                                    )}
                                    onClick={() => !isActive && setActiveCard(card.id)}
                                >
                                     <div className={cn("absolute inset-0 bg-background/50 backdrop-blur-sm", isActive ? "opacity-0" : "opacity-100")} />
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
