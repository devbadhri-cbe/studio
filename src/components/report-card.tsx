

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VitaminDChart } from './vitamin-d-chart';
import { Separator } from './ui/separator';
import { useApp } from '@/context/app-context';
import { Droplet, Heart, Sun, Activity, Zap, HeartPulse, TrendingUp, Printer } from 'lucide-react';
import { ThyroidChart } from './thyroid-chart';
import { BloodPressureChart } from './blood-pressure-chart';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { WeightChart } from './weight-chart';
import { kgToLbs } from '@/lib/utils';
import { Button } from './ui/button';
import { FastingBloodGlucoseChart } from './fasting-blood-glucose-chart';
import { Hba1cChart } from './hba1c-chart';
import { LipidChart } from './lipid-chart';
import { HemoglobinChart } from './hemoglobin-chart';
import { BiomarkerKey } from '@/lib/types';


export function ReportCard() {
  const { 
    profile, 
    getDisplayVitaminDValue, 
    getDisplayGlucoseValue,
    getDisplayHemoglobinValue,
    biomarkerUnit 
  } = useApp();
  const formatDate = useDateFormatter();

  const enabledBiomarkers = Object.values(profile.enabledBiomarkers || {}).flat() as BiomarkerKey[];

  const getLatestRecord = <T extends { date: string | Date }>(records: T[]) => 
    records && records.length > 0 ? [...records].sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0] : null;

  const latestFastingBloodGlucose = getLatestRecord(profile.fastingBloodGlucoseRecords);
  const latestVitaminD = getLatestRecord(profile.vitaminDRecords);
  const latestThyroid = getLatestRecord(profile.thyroidRecords);
  const latestBloodPressure = getLatestRecord(profile.bloodPressureRecords);
  const latestWeight = getLatestRecord(profile.weightRecords);
  const latestHba1c = getLatestRecord(profile.hba1cRecords);
  const latestHemoglobin = getLatestRecord(profile.hemoglobinRecords);

  const isImperial = profile.unitSystem === 'imperial';
  const vitDUnit = biomarkerUnit === 'si' ? 'nmol/L' : 'ng/mL';
  const glucoseUnit = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';
  const hemoglobinUnit = biomarkerUnit === 'si' ? 'g/L' : 'g/dL';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  const isBiomarkerEnabled = (key: BiomarkerKey) => enabledBiomarkers.includes(key);

  const chartComponents: Record<BiomarkerKey, React.ReactNode> = {
    hba1c: (
        <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">HbA1c Trend</CardTitle>
              <div className="h-[300px] w-full"><Hba1cChart /></div>
            </section>
        </>
    ),
    glucose: (
        <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">Fasting Blood Glucose Trend</CardTitle>
              <div className="h-[300px] w-full"><FastingBloodGlucoseChart /></div>
            </section>
        </>
    ),
    bloodPressure: (
        <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">Blood Pressure Trend</CardTitle>
              <BloodPressureChart />
            </section>
        </>
    ),
    weight: (
        <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">Weight Trend</CardTitle>
              <div className="h-[300px] w-full"><WeightChart /></div>
            </section>
        </>
    ),
    vitaminD: (
        <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">Vitamin D Trend</CardTitle>
              <VitaminDChart />
            </section>
        </>
    ),
    thyroid: (
        <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">TSH Trend</CardTitle>
              <ThyroidChart />
            </section>
        </>
    ),
    hemoglobin: (
        <>
            <Separator />
            <section>
                <CardTitle className="text-lg mb-4">Hemoglobin Trend</CardTitle>
                <div className="h-[300px] w-full"><HemoglobinChart /></div>
            </section>
        </>
    ),
    totalCholesterol: (
        <>
            <Separator />
            <section>
                <CardTitle className="text-lg mb-4">Lipids Trend</CardTitle>
                <LipidChart />
            </section>
        </>
    ),
    ldl: null, // Handled by totalCholesterol
    hdl: null, // Handled by totalCholesterol
    triglycerides: null, // Handled by totalCholesterol
  };

  const hasLipidBiomarker = ['totalCholesterol', 'ldl', 'hdl', 'triglycerides'].some(b => isBiomarkerEnabled(b as BiomarkerKey));


  return (
    <Card className="h-full shadow-xl">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="grid gap-2">
          <CardTitle>Comprehensive Health Report</CardTitle>
          <CardDescription>An overview of your key health metrics and trends.</CardDescription>
        </div>
         <div className="ml-auto flex-shrink-0 no-print">
            <Button onClick={() => window.print()} variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print / Save PDF
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 px-2 md:px-6">
        
        <section>
          <CardTitle className="text-lg mb-2">Latest Results</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isBiomarkerEnabled('hba1c') && latestHba1c && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">HbA1c</CardTitle><Droplet className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{latestHba1c.value.toFixed(1)} <span className="text-base font-normal text-muted-foreground">%</span></div><p className="text-xs text-muted-foreground">on {formatDate(latestHba1c.date)}</p></CardContent>
                </Card>
            )}
            {isBiomarkerEnabled('glucose') && latestFastingBloodGlucose && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Fasting Glucose</CardTitle><Droplet className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{getDisplayGlucoseValue(latestFastingBloodGlucose.value)} <span className="text-base font-normal text-muted-foreground">{glucoseUnit}</span></div><p className="text-xs text-muted-foreground">on {formatDate(latestFastingBloodGlucose.date)}</p></CardContent>
                </Card>
            )}
            {isBiomarkerEnabled('vitaminD') && latestVitaminD && (
                 <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Vitamin D</CardTitle><Sun className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{getDisplayVitaminDValue(latestVitaminD.value)} <span className="text-base font-normal text-muted-foreground">{vitDUnit}</span></div><p className="text-xs text-muted-foreground">on {formatDate(latestVitaminD.date)}</p></CardContent>
                </Card>
            )}
            {isBiomarkerEnabled('thyroid') && latestThyroid && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">TSH</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{latestThyroid.tsh.toFixed(2)} <span className="text-base font-normal text-muted-foreground">μIU/mL</span></div><p className="text-xs text-muted-foreground">on {formatDate(latestThyroid.date)}</p></CardContent>
                </Card>
            )}
            {isBiomarkerEnabled('bloodPressure') && latestBloodPressure && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Blood Pressure</CardTitle><Zap className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{latestBloodPressure.systolic}/{latestBloodPressure.diastolic} <span className="text-base font-normal text-muted-foreground">mmHg</span></div><p className="text-xs text-muted-foreground">on {formatDate(latestBloodPressure.date)}</p></CardContent>
                </Card>
            )}
            {isBiomarkerEnabled('bloodPressure') && latestBloodPressure && latestBloodPressure.heartRate && (
                 <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Heart Rate</CardTitle><HeartPulse className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{latestBloodPressure.heartRate} <span className="text-base font-normal text-muted-foreground">bpm</span></div><p className="text-xs text-muted-foreground">on {formatDate(latestBloodPressure.date)}</p></CardContent>
                </Card>
            )}
            {isBiomarkerEnabled('hemoglobin') && latestHemoglobin && (
                 <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Hemoglobin</CardTitle><Droplet className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{getDisplayHemoglobinValue(latestHemoglobin.hemoglobin)} <span className="text-base font-normal text-muted-foreground">{hemoglobinUnit}</span></div><p className="text-xs text-muted-foreground">on {formatDate(latestHemoglobin.date)}</p></CardContent>
                </Card>
            )}
            {isBiomarkerEnabled('weight') && latestWeight && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Weight & BMI</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent>
                     <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-bold">
                            {isImperial ? kgToLbs(latestWeight.value).toFixed(1) : latestWeight.value.toFixed(1)}
                            <span className="text-base font-normal text-muted-foreground"> {weightUnit}</span>
                        </div>
                        {profile.bmi && (
                             <div className="text-lg font-bold text-muted-foreground">
                                (<span className="text-base">BMI </span>{profile.bmi.toFixed(1)})
                            </div>
                        )}
                     </div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestWeight.date)}</p>
                  </CardContent>
                </Card>
            )}
          </div>
        </section>

        {enabledBiomarkers.map(key => {
            if (key === 'totalCholesterol' && hasLipidBiomarker) {
                 return <div key="lipids">{chartComponents.totalCholesterol}</div>
            }
            if (chartComponents[key] && key !== 'totalCholesterol' && key !== 'ldl' && key !== 'hdl' && key !== 'triglycerides') {
                return <div key={key}>{chartComponents[key]}</div>
            }
            return null;
        })}
      </CardContent>
    </Card>
  );
}
