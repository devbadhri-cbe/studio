
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BiomarkerSuggestionToggleCardProps {
    onToggle: () => void;
    isSuggestionsVisible: boolean;
}

export function BiomarkerSuggestionToggleCard({ onToggle, isSuggestionsVisible }: BiomarkerSuggestionToggleCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
           <Lightbulb className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
                <p className="font-medium">AI Biomarker Suggestions</p>
                <p className="text-xs text-muted-foreground">Suggest new biomarkers to monitor based on verified conditions.</p>
            </div>
            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isSuggestionsVisible && "rotate-180")} />
        </div>
      </CardContent>
    </Card>
  );
}
