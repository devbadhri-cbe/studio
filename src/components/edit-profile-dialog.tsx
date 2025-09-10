
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { updatePatient } from '@/lib/firestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { ftInToCm } from '@/lib/utils';
import { PatientForm, type PatientFormData } from './patient-form';
import { ScrollArea } from './ui/scroll-area';


interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { profile, setProfile } = useApp();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const isImperial = profile.unitSystem === 'imperial';

   const onProfileSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);

    let heightInCm: number | undefined;
    if (isImperial) {
        const ft = data.height_ft ? Number(data.height_ft) : 0;
        const inches = data.height_in ? Number(data.height_in) : 0;
        heightInCm = ft > 0 || inches > 0 ? ftInToCm(ft, inches) : undefined;
    } else {
        heightInCm = data.height ? Number(data.height) : undefined;
    }

     const updatedProfileData = {
        name: data.name,
        dob: data.dob.toISOString(),
        gender: data.gender,
        email: data.email,
        country: data.country,
        phone: data.phone || '',
        height: heightInCm,
    };

    try {
        const updatedPatient = await updatePatient(profile.id, updatedProfileData);
        setProfile(updatedPatient);
        toast({
            title: 'Profile Updated',
            description: 'Your details have been successfully saved.',
        });
        onOpenChange(false);
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

  const formContent = (
      <PatientForm
        patient={profile}
        onSubmit={onProfileSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => onOpenChange(false)}
      />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
           <SheetHeader className="p-6 border-b">
            <SheetTitle>Edit Profile</SheetTitle>
            <SheetDescription>
              Update your personal details below. Your name cannot be changed.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(90vh-80px)]">
            <div className="p-6">{formContent}</div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal details below. Your name cannot be changed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
                <div className="p-6">
                    {formContent}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
