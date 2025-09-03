
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowRight, Check } from 'lucide-react';

const TOUR_STORAGE_KEY = 'health-guardian-tour-completed';

const tourSteps = [
  {
    id: 'tour-step-1',
    title: 'Your Profile Hub',
    content: 'This area contains your personal profile, medical conditions, and current medications. Keep this information up-to-date!',
    side: 'bottom' as const,
  },
  {
    id: 'tour-step-2',
    title: 'Upload Results',
    content: 'Easily upload your lab results here. Our AI will extract the data and add it to your records automatically.',
    side: 'bottom' as const,
  },
  {
    id: 'tour-step-3',
    title: 'Reminders & Insights',
    content: 'Get personalized AI-powered insights and reminders for your next tests to stay on top of your health.',
    side: 'bottom' as const,
  },
  {
    id: 'tour-step-4',
    title: 'Biomarker Dashboards',
    content: 'Your doctor can enable specific dashboards here to track trends in your key biomarkers over time.',
    side: 'top' as const,
  },
  {
    id: 'tour-step-5',
    title: 'Comprehensive Report',
    content: 'View and print a full report of your latest results and trends to share with your doctor.',
    side: 'top' as const,
  },
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasCompletedTour) {
        // Use a timeout to ensure the UI has rendered and target elements are available
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Could not access localStorage for tour:", error);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch (error) {
       console.error("Could not save tour completion status to localStorage:", error);
    }
    setIsOpen(false);
  };
  
  const step = tourSteps[currentStep];

  if (!isOpen || !step) {
    return null;
  }
  
  const targetElement = document.getElementById(step.id);

  if (!targetElement) {
    // If the element for the current step isn't visible, skip to the next one
    if(isOpen) handleNext();
    return null;
  }
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {/* The trigger is the element we're highlighting */}
        <div
            style={{
                position: 'fixed',
                top: targetElement.getBoundingClientRect().top,
                left: targetElement.getBoundingClientRect().left,
                width: targetElement.getBoundingClientRect().width,
                height: targetElement.getBoundingClientRect().height,
                pointerEvents: 'none',
            }}
        />
      </PopoverTrigger>
      <PopoverContent side={step.side} align="center" className="w-80 z-[101]">
        <div className="space-y-4">
          <h4 className="font-semibold leading-none">{step.title}</h4>
          <p className="text-sm text-muted-foreground">{step.content}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {tourSteps.length}
            </span>
            <Button onClick={handleNext} size="sm">
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Finish <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
