
'use client';

import * as React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardDescription, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface DiseaseCardLayoutProps {
  value: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function DiseaseCardLayout({ value, title, icon, children }: DiseaseCardLayoutProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const childrenArray = React.Children.toArray(children);
  const hasMultipleBiomarkers = childrenArray.length > 1;
  
  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  
  const Dots = (
    <div className="flex items-center justify-center gap-2 mt-4">
        {Array.from({ length: count }).map((_, i) => (
            <Button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                    "h-2 w-2 rounded-full p-0",
                    current === i ? "bg-primary" : "bg-primary/20"
                )}
                size="icon"
                variant="ghost"
            />
        ))}
    </div>
  );

  return (
    <AccordionItem value={value}>
        <AccordionTrigger>
             <div className="flex items-center gap-3 text-left w-full cursor-pointer p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {icon}
                </div>
                <div className="flex-1">
                    <CardTitle>{title}</CardTitle>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <div className="p-6 pt-0 w-full">
                 <Separator className="mb-6" />
                {hasMultipleBiomarkers ? (
                    <Carousel setApi={setApi} className="w-full">
                        <CarouselContent>
                            {childrenArray.map((child, index) => (
                                <CarouselItem key={index} className="flex-shrink-0">
                                    <div>
                                        {child}
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {Dots}
                    </Carousel>
                ) : (
                    <div>
                        {children}
                    </div>
                )}
            </div>
        </AccordionContent>
    </AccordionItem>
  );
}
