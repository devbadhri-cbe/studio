
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Loader2, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Patient } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { PatientCard } from '@/components/patient-card';
import { getPatientsPaginated, deletePatient, addPatient, updatePatient } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientForm, type PatientFormData } from '@/components/patient-form';
import { useApp } from '@/context/app-context';
import { TitleBar } from '@/components/ui/title-bar';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { processPatientData } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, logout } from '@/lib/auth';

const PAGE_SIZE = 8;

export default function DoctorDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { setPatientData, setIsDoctorLoggedIn, isClient } = useApp();
    const [user, setUser] = React.useState<User | null>(null);
    const [patients, setPatients] = React.useState<Patient[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [lastVisible, setLastVisible] = React.useState<any>(null);
    const [hasMore, setHasMore] = React.useState(true);
    const [isFetchingMore, setIsFetchingMore] = React.useState(false);
    const loadMoreRef = React.useRef(null);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            setIsDoctorLoggedIn(true);
          } else {
            setUser(null);
            setIsDoctorLoggedIn(false);
            router.push('/doctor/login');
          }
        });
        return () => unsubscribe();
    }, [router, setIsDoctorLoggedIn]);

    const fetchPatients = React.useCallback(async (loadMore = false) => {
        if (!user) return;

        if (!loadMore) {
            setIsLoading(true);
            setPatients([]);
            setLastVisible(null);
            setHasMore(true);
        } else {
            if (!hasMore || isFetchingMore) return;
            setIsFetchingMore(true);
        }

        try {
            const { patients: newPatients, lastVisible: newLastVisible } = await getPatientsPaginated(user.uid, loadMore ? lastVisible : null, PAGE_SIZE);
            const fetchedPatients = newPatients.map(processPatientData);
            
            setPatients(prev => loadMore ? [...prev, ...fetchedPatients] : fetchedPatients);
            setLastVisible(newLastVisible);
            setHasMore(newPatients.length === PAGE_SIZE);

        } catch (error) {
            console.error("Failed to fetch patients from Firestore", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load patient data. Please check your connection and permissions."
            });
        } finally {
            if (!loadMore) setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [toast, lastVisible, hasMore, isFetchingMore, user]);
    
    React.useEffect(() => {
        if (user) {
            fetchPatients(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    
    useIntersectionObserver({
        target: loadMoreRef,
        onIntersect: () => fetchPatients(true),
        enabled: hasMore && !isLoading && !isFetchingMore && !searchQuery,
    });


    const viewPatientDashboard = (patient: Patient) => {
        setPatientData(patient);
        router.push(`/patient/${patient.id}?viewer=doctor`);
    }
    
    const removePatient = async (patientId: string) => {
        try {
            await deletePatient(patientId);
            setPatients(patients.filter(p => p.id !== patientId));
            setPatientToDelete(null);
            toast({
                title: 'Patient Deleted',
                description: 'The patient has been removed from the list.'
            });
        } catch (error) {
             console.error("Failed to delete patient:", error);
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete patient. Please try again.',
             });
        }
    }

    const handleFormSubmit = async (data: PatientFormData) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to manage patients.' });
            return;
        }
        setIsSubmitting(true);
        const patientData = {
            name: data.name,
            dob: data.dob.toISOString(),
            gender: data.gender,
            email: data.email || '',
            country: data.country,
            phone: data.phone || '',
        };

        try {
            if (editingPatient) {
                const updatedPatientData = await updatePatient(editingPatient.id, patientData);
                const processedPatient = processPatientData(updatedPatientData);
                 setPatients(prev => prev.map(p => p.id === processedPatient.id ? processedPatient : p));
                toast({
                    title: 'Patient Updated',
                    description: `${processedPatient.name}'s details have been updated.`,
                });
            } else {
                const doctorName = user.displayName || user.email || 'Assigned Doctor';
                const doctorEmail = user.email || '';
                const newPatient = await addPatient({ 
                    ...patientData, 
                    doctorUid: user.uid,
                    doctorName: doctorName,
                    doctorEmail: doctorEmail,
                });
                const processedPatient = processPatientData(newPatient);
                setPatients(prev => [processedPatient, ...prev]);
                toast({
                    title: 'Patient Added',
                    description: `${newPatient.name} has been successfully added.`,
                });
            }
            closeForm();
        } catch (error) {
            console.error("Failed to save patient", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not save the patient. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const openFormToAdd = () => {
        setEditingPatient(null);
        setIsFormOpen(true);
    }
    
    const openFormToEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setIsFormOpen(true);
    }

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingPatient(null);
    }

    const handleLogout = async () => {
        await logout();
        router.push('/doctor/login');
    }
    
    const filteredAndSortedPatients = React.useMemo(() => {
        let processedPatients = [...patients];

        if (searchQuery) {
            processedPatients = processedPatients.filter(patient => {
                const query = searchQuery.toLowerCase();
                return (
                    patient.name.toLowerCase().includes(query) ||
                    (patient.email && patient.email.toLowerCase().includes(query)) ||
                    (patient.phone && patient.phone.toLowerCase().includes(query))
                );
            });
        }

        return processedPatients.sort((a, b) => {
            const aNeedsReview = a.presentMedicalConditions?.some(c => c.status === 'pending_review') || a.dashboardSuggestions?.some(s => s.status === 'pending');
            const bNeedsReview = b.presentMedicalConditions?.some(c => c.status === 'pending_review') || b.dashboardSuggestions?.some(s => s.status === 'pending');
            
            if (aNeedsReview && !bNeedsReview) return -1;
            if (!aNeedsReview && bNeedsReview) return 1;

            const aDate = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
            const bDate = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
            if (aDate !== bDate) return bDate - aDate;
            
            return a.name.localeCompare(b.name);
        });
    }, [patients, searchQuery]);

  if (!user || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="ml-4">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
        <TitleBar>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleLogout} size="icon" variant="ghost">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Logout</p>
                </TooltipContent>
            </Tooltip>
        </TitleBar>
        <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto w-full max-w-7xl">
                {isFormOpen ? (
                    <Card className="max-w-[800px] mx-auto">
                        <CardHeader>
                            <CardTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</CardTitle>
                            <CardDescription>
                                {editingPatient ? "Update the patient's details below." : "Enter the new patient's information to get started."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <PatientForm 
                                patient={editingPatient ?? undefined}
                                onSubmit={handleFormSubmit} 
                                isSubmitting={isSubmitting}
                                onCancel={closeForm}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <>
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold font-headline">
                                Patient Overview
                            </h1>
                            <p className="text-muted-foreground">
                                Manage and review your patients' health data.
                            </p>
                        </div>
                        <Button onClick={openFormToAdd}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Patient
                        </Button>
                    </div>
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="grid gap-2 flex-1">
                                <CardTitle>{user.displayName || 'Your'} Patient List</CardTitle>
                                <CardDescription>A scrollable list of all patients currently under your care.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <div className="relative w-full sm:w-auto">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search all patients..."
                                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[calc(100vh-380px)]">
                                {isLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-4">
                                        {[...Array(PAGE_SIZE)].map((_, i) => <Skeleton key={i} className="h-[300px] w-full" />)}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-4">
                                        {filteredAndSortedPatients.map((patient) => (
                                            <PatientCard
                                                key={patient.id}
                                                patient={patient}
                                                onView={viewPatientDashboard}
                                                onDelete={setPatientToDelete}
                                                onEdit={openFormToEdit}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div ref={loadMoreRef} className="h-4" />
                                {isFetchingMore && (
                                    <div className="flex justify-center items-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                                {(!isLoading && filteredAndSortedPatients.length === 0) && (
                                    <div className="text-center text-muted-foreground py-12">
                                        <p>No patients found.</p>
                                        {searchQuery ? <p className="text-sm">Try adjusting your search query.</p> : <p className="text-sm">Add a new patient to get started.</p>}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    </>
                )}

            </div>
        </main>
        <AlertDialog open={!!patientToDelete} onOpenChange={() => setPatientToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the patient record for <span className="font-semibold">{patientToDelete?.name}</span> and remove all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => patientToDelete && removePatient(patientToDelete.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </div>
    </TooltipProvider>
  );
}
