

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Settings, Search, ChevronDown, Check } from 'lucide-react';
import { availableBiomarkerCards, type BiomarkerKey, availableDiseasePanels, DiseasePanelKey } from '@/lib/biomarker-cards';
import { useApp } from '@/context/app-context';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { dateFormats } from '@/lib/countries';
import type { UnitSystem } from '@/lib/types';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';


interface DiseasePanelCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode; 
  className?: string;
  isDoctorLoggedIn: boolean;
  panelKey: string;
  allPanelBiomarkers: (BiomarkerKey | string)[];
}

type OpenSection = 'newRecord' | 'manageBiomarkers' | 'displaySettings' | 'managePanels' | null;


export function DiseasePanelCard({ 
    title, 
    icon, 
    children, 
    className, 
    isDoctorLoggedIn, 
    panelKey,
    allPanelBiomarkers,
}: DiseasePanelCardProps) {
    const { profile, setProfile, biomarkerUnit, setBiomarkerUnit, toggleDiseaseBiomarker, toggleDiseasePanel }