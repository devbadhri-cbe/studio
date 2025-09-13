
'use client';

import { UserCircle, Mail, Phone, VenetianMask, Globe, Cake, Stethoscope as DoctorIcon } from 'lucide-react';
import * as React from 'react';
import { useApp } from '@/context/app-context';
import { calculateAge, formatDisplayPhoneNumber } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { ProfileSettingsPopover } from './profile-settings-popover';
import { PatientForm, type PatientFormData } from './patient-form';
import { ftInToCm } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Patient } from '@/lib/types';
import { EditDoctorDetailsDialog } from './edit-doctor-details-dialog';
import { Separator } from './ui/separator';
import { UniversalCard } from './universal-card';


export function ProfileCard() {
  const { profile, setPatient } = useApp();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isEditingDoctor, setIsEditingDoctor] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formatDate = useDateFormatter();
  
  const calculatedAge = calculateAge(profile.dob);
  const country = countries.find(c => c.code === profile.country);
  const countryName = country?.name || profile.country;
  const formattedPhone = formatDisplayPhoneNumber(profile.phone, profile.country);
  const formattedDoctorPhone = formatDisplayPhoneNumber(profile.doctorPhone, profile.country);

  const onProfileSubmit = async (data: PatientFormData) => {
    if (!profile) return;
    setIsSubmitting(true);
    
    const countryInfo = countries.find(c => c.code === data.country);
    const isImperial = countryInfo?.unitSystem === 'imperial';

    let heightInCm: number | undefined;
    if (isImperial) {
        const ft = data.height_ft ? Number(data.height_ft) : 0;
        const inches = data.height_in ? Number(data.height_in) : 0;
        heightInCm = ft > 0 || inches > 0 ? ftInToCm(ft, inches) : undefined;
    } else {
        heightInCm = data.height ? Number(data.height) : undefined;
    }

    try {
        const latestWeight = [...(profile.weightRecords || [])].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
        const newBmi = calculateBmi(latestWeight?.value, heightInCm);

        const updatedProfile: Patient = {
            ...profile,
            name: data.name,
            dob: data.dob.toISOString(),
            gender: data.gender,
            email: data.email,
            country: data.country,
            phone: data.phone || '',
            height: heightInCm,
            dateFormat: countryInfo?.dateFormat || profile.dateFormat,
            unitSystem: countryInfo?.unitSystem || profile.unitSystem,
            bmi: newBmi,
        };
        
        setPatient(updatedProfile);

        toast({
            title: 'Profile Updated',
            description: 'Your details have been successfully saved.',
        });
        setIsEditing(false);
    } catch (error) {
        console.error("Failed to update profile", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update profile. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <>
    <UniversalCard
      icon={<UserCircle className="h-6 w-6 text-primary" />}
      title={isEditing ? 'Edit Profile' : 'My Profile'}
      description={isEditing ? 'Update your personal details below.' : 'Your personal and medical information.'}
      actions={<ProfileSettingsPopover onEdit={() => setIsEditing(true)} onEditDoctor={() => setIsEditingDoctor(true)} />}
    >
        {isEditing ? (
            <PatientForm
                onSubmit={onProfileSubmit}
                onCancel={() => setIsEditing(false)}
                isSubmitting={isSubmitting}
                initialData={profile}
            />
        ) : (
            <div className="space-y-4 text-sm">
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
                 <div className="rounded-lg border bg-card p-4 space-y-3">
                     <h4 className="font-medium text-sm flex items-center gap-3">
                         <DoctorIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                         Consulting Doctor
                     </h4>
                     <Separator />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <UserCircle className="h-5 w-5 shrink-0" />
                            <p>{profile.doctorName || 'Not specified'}</p>
                        </div>
                         <div className="flex items-center gap-3 text-muted-foreground">
                            <Phone className="h-5 w-5 shrink-0" />
                            <p>{formattedDoctorPhone}</p>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-3 text-muted-foreground">
                            <Mail className="h-5 w-5 shrink-0" />
                            <p>{profile.doctorEmail || 'Not specified'}</p>
                        </div>
                    </div>
                 </div>
            </div>
        )}
    </UniversalCard>
    <EditDoctorDetailsDialog open={isEditingDoctor} onOpenChange={setIsEditingDoctor} />
    </>
  );
}
