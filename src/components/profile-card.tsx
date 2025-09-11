
'use client';

import { UserCircle, Mail, Phone, VenetianMask, Globe, Cake } from 'lucide-react';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { calculateAge, formatDisplayPhoneNumber } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { ProfileSettingsPopover } from './profile-settings-popover';
import { EditProfileDialog } from './edit-profile-dialog';


export function ProfileCard() {
  const { profile } = useApp();
  const [isEditing, setIsEditing] = React.useState(false);
  const formatDate = useDateFormatter();
  
  const calculatedAge = calculateAge(profile.dob);
  const country = countries.find(c => c.code === profile.country);
  const countryName = country?.name || profile.country;
  const formattedPhone = formatDisplayPhoneNumber(profile.phone, profile.country);


  return (
    <>
    <Card className="h-full shadow-xl lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCircle className="h-10 w-10 shrink-0 text-muted-foreground" />
              <div>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your personal and medical information.</CardDescription>
              </div>
            </div>
             <div className="flex items-center gap-1">
                 <ProfileSettingsPopover onEdit={() => setIsEditing(true)} />
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3 text-muted-foreground">
                <Cake className="h-5 w-5 shrink-0" />
                <p>
                    {profile.dob ? formatDate(profile.dob) : 'N/A'}
                    {calculatedAge !== null && ` (${calculatedAge} yrs)`}
                </p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <VenetianMask className="h-5 w-5 shrink-0" />
                <p><span className="capitalize">{profile.gender || 'N/A'}</span></p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="h-5 w-5 shrink-0" />
                <p>{countryName}</p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 shrink-0" />
                <p>{profile.email || 'N/A'}</p>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 shrink-0" />
                <p>{formattedPhone}</p>
            </div>
        </div>
      </CardContent>
    </Card>
    <EditProfileDialog open={isEditing} onOpenChange={setIsEditing} />
    </>
  );
}
