
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';

interface InteractivePanelGridProps {
    children: React.ReactNode;
}

export function InteractivePanelGrid({ children }: InteractivePanelGridProps) {
    const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
    const { isDoctorLoggedIn } = useApp();
    
    const validChildren = React.Children.toArray(children).filter(React.isValidElement);

    React.useEffect(() => {
        // If there's only one card, default to expanded view
        if (validChildren.length === 1 && !isDoctorLoggedIn) {
            setExpandedIndex(0);
        } else {
            setExpandedIndex(null);
        }
    }, [validChildren.length, isDoctorLoggedIn]);
    
    const handleCardClick = (index: number) => {
        setExpandedIndex(index);
    };

    const handleBackClick = () => {
        // Don't go back to grid if there's only one item unless it's the doctor viewing
        if (validChildren.length > 1 || isDoctorLoggedIn) {
            setExpandedIndex(null);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(index);
        }
    };

    if (expandedIndex !== null) {
        return (
            <div className="flex-1 flex flex-col h-full">
                {(validChildren.length > 1 || isDoctorLoggedIn) && (
                     <div className="mb-2">
                        <Button variant="ghost" size="sm" onClick={handleBackClick}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Panel
                        </Button>
                    </div>
                )}
                <div className="flex-1 flex flex-col">
                    {validChildren[expandedIndex]}
                </div>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {validChildren.map((child, index) => (
                <div
                    key={index}
                    onClick={() => handleCardClick(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    role="button"
                    tabIndex={0}
                    className={cn(
                        "text-left h-full transition-all duration-200 ease-in-out cursor-pointer",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                    )}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}
