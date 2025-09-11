
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Code, DollarSign, Rocket, Users, ShieldCheck } from 'lucide-react';

const PlanItem = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-1">
            <CheckCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-muted-foreground text-sm">{children}</p>
        </div>
    </div>
);

export default function ProjectPlanPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold font-headline text-primary">Project Health Guardian: Vision & Plan</h1>
          <p className="text-lg text-muted-foreground mt-2">A patient-centric application with a sustainable future.</p>
        </header>

        <div className="space-y-12">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <Users className="h-6 w-6 text-primary" />
                        The Role of the Developer
                    </CardTitle>
                    <CardDescription>
                        The developer's role shifts from managing a central service to building and maintaining a powerful, self-contained client-side application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <PlanItem title="Core Application Maintenance">
                        Ensuring the app is stable, fast, and bug-free. This includes updating frameworks like Next.js and React and fixing any issues that arise.
                    </PlanItem>
                    <PlanItem title="Feature Development">
                        Building new default features that are free for all users, such as improved charts, better data export options, or enhanced reminder logic.
                    </PlanItem>
                    <PlanItem title="Premium Feature Creation">
                        Developing new, advanced biomarker cards and other premium features that will be part of the subscription.
                    </PlanItem>
                     <PlanItem title="AI Flow Management">
                        Creating, refining, and managing the Genkit AI flows that power the app's intelligent features to ensure they are efficient and accurate.
                    </PlanItem>
                    <PlanItem title="Monetization Logic">
                        Implementing the technical infrastructure for a subscription model to unlock premium features for paying users.
                    </PlanItem>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <ShieldCheck className="h-6 w-6 text-green-500" />
                        Privacy, Security & GDPR Compliance
                    </CardTitle>
                    <CardDescription>
                       Our local-first architecture is designed with privacy as its foundation, aligning perfectly with modern data protection regulations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <PlanItem title="Patient Data Sovereignty">
                        All patient health data is stored exclusively on the user's device. We do not have a central database of patient information, virtually eliminating the risk of a large-scale data breach.
                    </PlanItem>
                    <PlanItem title="GDPR 'Privacy by Design'">
                        The application is built to be inherently compliant with GDPR principles. Patients have direct access (Article 15), the ability to erase data by clearing browser storage (Article 17), and the ability to export their data (Article 20).
                    </PlanItem>
                    <PlanItem title="No Centralized Tracking">
                        The app does not track user behavior or collect analytics. The user is in complete control of their data and how it is used.
                    </PlanItem>
                     <PlanItem title="Secure Sharing">
                        Data is only shared when a patient explicitly generates a temporary, read-only link. There is no persistent doctor access or central directory of users.
                    </PlanItem>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <Rocket className="h-6 w-6 text-primary" />
                        Subscription Model Plan: Freemium Approach
                    </CardTitle>
                    <CardDescription>
                        The base app will remain free, with premium features available via a subscription. This is achieved using a "Feature Flag" system within the patient's local data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 p-4 border-l-4 border-primary/50 bg-muted/30 rounded-r-lg">
                        <h3 className="font-semibold flex items-center gap-2"><Code className="h-5 w-5"/>Step 1: Designate Premium Biomarkers</h3>
                        <p className="text-sm text-muted-foreground">
                            I will first differentiate between "core" (free) and "premium" biomarkers. Core biomarkers like Weight and Blood Pressure will always be free. More specialized ones like Uric Acid or Serum Creatinine will be designated as premium.
                        </p>
                    </div>
                     <div className="space-y-4 p-4 border-l-4 border-primary/50 bg-muted/30 rounded-r-lg">
                        <h3 className="font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5"/>Step 2: Implement a Simple Unlock System</h3>
                        <p className="text-sm text-muted-foreground">
                            To avoid complex user accounts, I will create a system where users can enter a unique purchase code to unlock features. This involves creating a locked UI for premium cards and a placeholder "Entitlement Service" to validate these codes.
                        </p>
                    </div>
                     <div className="space-y-4 p-4 border-l-4 border-primary/50 bg-muted/30 rounded-r-lg">
                        <h3 className="font-semibold flex items-center gap-2"><CheckCircle className="h-5 w-5"/>Step 3: Update Data Model & UI Logic</h3>
                        <p className="text-sm text-muted-foreground">
                            I will add an `unlockedFeatures` array to the patient's local data file. The app's UI will then dynamically check this array to show either the full biomarker card or a "locked" version, prompting the user to subscribe.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
