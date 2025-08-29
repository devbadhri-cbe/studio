
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { getPatient } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat-interface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const { isClient, isDoctorLoggedIn } = useApp();
    const patientId = params.patientId as string;
    const [patientName, setPatientName] = React.useState('');
    const [patientPhotoUrl, setPatientPhotoUrl] = React.useState<string | undefined>('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!patientId) return;

        const fetchPatientInfo = async () => {
            try {
                const patient = await getPatient(patientId);
                if (patient) {
                    setPatientName(patient.name);
                    setPatientPhotoUrl(patient.photoUrl);
                } else {
                    setError('Patient not found.');
                }
            } catch (e) {
                console.error("Failed to fetch patient info:", e);
                setError('Failed to load patient information.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientInfo();
    }, [patientId]);

    const goBack = () => {
        if (isDoctorLoggedIn) {
            router.push('/doctor/dashboard');
        } else {
            router.push(`/patient/${patientId}`);
        }
    }

    if (!isClient || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="ml-4">Loading Chat...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-background text-destructive text-center p-4">
                <p>{error}</p>
                <Button onClick={goBack} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="flex items-center gap-4 border-b bg-muted/40 px-4 lg:px-6 h-14">
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}>
                    <ArrowLeft className="h-5 w-5" />
                 </Button>
                 <div className="flex items-center gap-3">
                     <Avatar>
                        <AvatarImage src={patientPhotoUrl} />
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-semibold">{patientName}</h1>
                        <span className="text-xs text-muted-foreground">Chat</span>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex flex-col overflow-hidden">
                <ChatInterface patientId={patientId} />
            </main>
        </div>
    );
}
