
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { UploadRecordDialog } from '@/components/upload-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { updatePatient } from '@/lib/firestore';
import { LayoutGrid, MessageSquareText, GaugeCircle, UploadCloud, Loader2, User, Upload } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.31 20.6C8.75 21.38 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.04 20.13C10.56 20.13 9.12 19.74 7.85 19L7.54 18.82L4.44 19.6L5.25 16.58L4.93 16.27C4.14 14.9 3.79 13.41 3.79 11.91C3.79 7.36 7.5 3.65 12.04 3.65C14.28 3.65 16.32 4.5 17.84 5.99C19.33 7.48 20.2 9.49 20.2 11.91C20.2 16.46 16.59 20.13 12.04 20.13M16.56 14.45C16.31 14.17 15.42 13.72 15.19 13.63C14.96 13.54 14.8 13.5 14.64 13.78C14.48 14.06 14.04 14.64 13.86 14.83C13.69 15.02 13.53 15.04 13.25 14.95C12.97 14.86 12.03 14.54 10.93 13.57C10.06 12.82 9.53 11.91 9.39 11.63C9.25 11.35 9.37 11.23 9.49 11.11C9.6 11 9.73 10.85 9.87 10.68C10 10.5 10.04 10.37 10.13 10.18C10.22 9.99 10.18 9.85 10.1 9.76C10.02 9.67 9.61 8.65 9.44 8.23C9.28 7.81 9.11 7.85 8.95 7.85H8.58C8.42 7.85 8.13 7.92 7.89 8.16C7.65 8.4 7.07 8.93 7.07 10.05C7.07 11.17 7.92 12.23 8.05 12.37C8.18 12.51 9.9 15.12 12.44 16.1C13.11 16.38 13.62 16.52 13.98 16.63C14.59 16.78 15.12 16.74 15.53 16.35C16.01 15.91 16.42 15.22 16.63 14.87C16.84 14.52 16.81 14.33 16.77 14.23C16.73 14.14 16.64 14.06 16.56 14.02" />
    </svg>
);

export function PatientHeader() {
  const { profile, setProfile, isDoctorLoggedIn } = useApp();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const doctorPhoneNumber = '+919791377716';

  const pageTitle = isDoctorLoggedIn
    ? `${profile.name}'s Dashboard`
    : `Welcome, ${profile.name || 'User'}!`;

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile.id) return;

    setIsUploading(true);
    try {
        const fileRef = ref(storage, `profile_photos/${profile.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        
        await updatePatient(profile.id, { photoUrl: downloadUrl });
        setProfile({ ...profile, photoUrl: downloadUrl });
        
        toast({
            title: 'Photo Uploaded',
            description: 'Your profile picture has been updated.',
        });
    } catch (error) {
        console.error("Photo upload failed:", error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not upload photo. Please try again.',
        });
    } finally {
        setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4 flex flex-col items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="relative rounded-full group shrink-0"
            >
                <Avatar className="h-20 w-20 md:h-24 md:w-24 cursor-pointer">
                    <AvatarImage src={profile.photoUrl} />
                    <AvatarFallback>
                        {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : 
                            <>
                                <User className="h-10 w-10 text-muted-foreground group-hover:hidden" />
                                <Upload className="h-10 w-10 text-muted-foreground hidden group-hover:block" />
                            </>
                        }
                    </AvatarFallback>
                </Avatar>
            </button>
        </TooltipTrigger>
        <TooltipContent>
            <p>Upload Photo</p>
        </TooltipContent>
      </Tooltip>
      <Input id="photo-upload" type="file" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" />

      <div className="flex flex-col items-center flex-1 gap-4 w-full">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-semibold font-headline">
            {pageTitle}
          </h1>
          <p className="text-sm text-muted-foreground">Your health overview. Consult your doctor before making any decisions.</p>
        </div>
        <div className="flex w-full flex-wrap justify-center gap-2">
          {!isDoctorLoggedIn && (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <MessageSquareText className="mr-2 h-4 w-4" />
                        Contact Doctor
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => window.open(`https://wa.me/${doctorPhoneNumber.replace(/\D/g, '')}`, '_blank')}>
                        <WhatsAppIcon className="w-4 h-4 mr-2" />
                        <span>WhatsApp</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => window.open(`sms:${doctorPhoneNumber.replace(/\D/g, '')}`)}>
                        <MessageSquareText className="w-4 h-4 mr-2" />
                        <span>SMS / iMessage</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      </CardContent>
    </Card>
  );
}
