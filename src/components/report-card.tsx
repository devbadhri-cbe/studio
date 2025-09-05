

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


export function ReportCard() {
  const { fastingBloodGlucoseRecords, vitaminDRecords, thyroidRecords, bloodPressureRecords, weightRecords, getDisplayVitaminDValue, getDisplayGlucoseValue, biomarkerUnit, profile } = useApp();
  const formatDate = useDateFormatter();

  const latestFastingBloodGlucose = [...fastingBloodGlucoseRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestVitaminD = [...vitaminDRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestThyroid = [...(thyroidRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestBloodPressure = [...(bloodPressureRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestWeight = [...(weightRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const isImperial = profile.unitSystem === 'imperial';
  const vitDUnit = biomarkerUnit === 'si' ? 'nmol/L' : 'ng/mL';
  const glucoseUnit = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';
  const weightUnit = isImperial ? 'lbs' : 'kg';

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
            {fastingBloodGlucoseRecords.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fasting Glucose</CardTitle>
                    <Droplet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getDisplayGlucoseValue(latestFastingBloodGlucose.value)} <span className="text-base font-normal text-muted-foreground">{glucoseUnit}</span></div>
                    <p className="text-xs text-muted-foreground">on {formatDate(latestFastingBloodGlucose.date)}</p>
                  </CardContent>
                </Card>
            )}
            {vitaminDRecords.length > 0 && (
                 <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vitamin D</CardTitle>
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{getDisplayVitaminDValue(latestVitaminD.value)} <span className="text-base font-normal text-muted-foreground">{vitDUnit}</span></div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestVitaminD.date)}</p>
                  </CardContent>
                </Card>
            )}
            {thyroidRecords.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">TSH</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{latestThyroid.tsh.toFixed(2)} <span className="text-base font-normal text-muted-foreground">μIU/mL</span></div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestThyroid.date)}</p>
                  </CardContent>
                </Card>
            )}
            {bloodPressureRecords.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{latestBloodPressure.systolic}/{latestBloodPressure.diastolic} <span className="text-base font-normal text-muted-foreground">mmHg</span></div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestBloodPressure.date)}</p>
                  </CardContent>
                </Card>
            )}
            {bloodPressureRecords.length > 0 && latestBloodPressure.heartRate && (
                 <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                    <HeartPulse className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{latestBloodPressure.heartRate} <span className="text-base font-normal text-muted-foreground">bpm</span></div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestBloodPressure.date)}</p>
                  </CardContent>
                </Card>
            )}
            {weightRecords.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weight & BMI</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
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

        {fastingBloodGlucoseRecords && fastingBloodGlucoseRecords.length > 0 && (
          <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">Fasting Blood Glucose Trend</CardTitle>
              <FastingBloodGlucoseChart />
            </section>
          </>
        )}

        {weightRecords && weightRecords.length > 0 && (
          <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">Weight Trend</CardTitle>
              <div className="h-[300px] w-full">
                <WeightChart />
              </div>
            </section>
          </>
        )}

        {bloodPressureRecords && bloodPressureRecords.length > 0 && (
          <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">Blood Pressure Trend</CardTitle>
              <BloodPressureChart />
            </section>
          </>
        )}
        
        {vitaminDRecords && vitaminDRecords.length > 0 && (
          <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">Vitamin D Trend</CardTitle>
              <VitaminDChart />
            </section>
          </>
        )}
        
        {thyroidRecords && thyroidRecords.length > 0 && (
          <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">TSH Trend</CardTitle>
              <ThyroidChart />
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
