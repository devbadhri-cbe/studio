
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useApp } from '@/context/app-context';

const FormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const DOCTOR_NAME = 'Dr. Badhrinathan N';

export default function DoctorLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setIsDoctorLoggedIn } = useApp();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: 'drbadhri@gmail.com',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      setIsDoctorLoggedIn(true);
      localStorage.setItem('doctor_logged_in', 'true');
      toast({
        title: 'Login Successful',
        description: `Welcome, ${DOCTOR_NAME}! Redirecting to your dashboard...`,
      });
      router.push('/doctor/dashboard');
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'The email or password you entered is incorrect. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex items-center justify-center gap-2 mb-4">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-headline">Health Guardian</span>
            </div>
          <CardTitle className="text-2xl">{DOCTOR_NAME}'s Portal</CardTitle>
          <CardDescription>Please enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="doctor@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="flex justify-center text-xs">
            <Link href="/" className="text-muted-foreground hover:text-primary">
                Are you a patient? Log in here.
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
