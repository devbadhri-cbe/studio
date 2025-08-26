
'use client';

import { UserCircle, Mail, Phone, VenetianMask, Globe, Stethoscope, Pill } from 'lucide-react';
import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { calculateAge } from '@/lib/utils';
import { MedicalConditionsList } from './medical-conditions-list';
import { countries } from '@/lib/countries';
import { Separator } from './ui/separator';

export function ProfileCard() {
  const { profile } = useApp();

  const calculatedAge = calculateAge(profile.dob);
  const countryName = countries.find(c => c.code === profile.country)?.name || profile.country;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your personal and medical information.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="space-y-4 rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
                <UserCircle className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{profile.name || 'N/A'}</p>
                </div>
            </div>
             <div className="flex items-start gap-3">
                <VenetianMask className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                    <p className="text-xs text-muted-foreground">Age & Gender</p>
                    <p className="font-medium">
                        {calculatedAge !== null ? `${calculatedAge} years` : 'N/A'}, <span className="capitalize">{profile.gender || 'N/A'}</span>
                    </p>
                </div>
            </div>
             <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email || 'N/A'}</p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone || 'N/A'}</p>
                </div>
            </div>
             <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="font-medium">{countryName}</p>
                </div>
            </div>
        </div>
        
        <div>
            <div className="flex items-center gap-3 mb-2">
                <Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />
                <h3 className="font-medium">Present Medical Conditions</h3>
            </div>
            {profile.presentMedicalConditions.length > 0 ? (
                <ul className="space-y-2">
                    {profile.presentMedicalConditions.map((condition) => (
                        <li key={condition.id} className="text-xs text-muted-foreground border-l-2 border-primary pl-3">
                            <span className="font-semibold text-foreground">{condition.condition}</span>
                            {condition.icdCode && ` (${condition.icdCode})`}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground pl-8">No conditions recorded.</p>
            )}
        </div>

        <div>
            <div className="flex items-center gap-3 mb-2">
                <Pill className="h-5 w-5 shrink-0 text-muted-foreground" />
                <h3 className="font-medium">Current Medication</h3>
            </div>
            {profile.medication.length > 0 ? (
                <ul className="space-y-2">
                    {profile.medication.map((med) => (
                         <li key={med.id} className="text-xs text-muted-foreground border-l-2 border-primary pl-3">
                            <span className="font-semibold text-foreground">{med.name}</span> ({med.dosage}, {med.frequency})
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-xs text-muted-foreground pl-8">No medication recorded.</p>
            )}
        </div>

      </CardContent>
    </Card>
  );
}
