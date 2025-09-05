
'use client';

import { DiabetesCard } from './diabetes-card';
import { HypertensionCard } from './hypertension-card';
import { Card, CardContent } from './ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import * as React from 'react';


export function DiseasePanel() {
    return (
        <Carousel
            opts={{
                align: "start",
            }}
            orientation="vertical"
            className="w-full"
        >
            <CarouselContent className="-mt-1 h-[550px]">
                <CarouselItem className="pt-1 md:basis-1/2">
                   <div className="p-1">
                        <DiabetesCard />
                    </div>
                </CarouselItem>
                <CarouselItem className="pt-1 md:basis-1/2">
                   <div className="p-1">
                        <HypertensionCard />
                    </div>
                </CarouselItem>
            </CarouselContent>
        </Carousel>
    );
}
