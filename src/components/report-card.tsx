
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hba1cChart } from './hba1c-chart';
import { LdlChart } from './ldl-chart';
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


export function ReportCard() {
  const { records, lipidRecords, vitaminDRecords, thyroidRecords, bloodPressureRecords, weightRecords, getDisplayLipidValue, getDisplayVitaminDValue, biomarkerUnit, profile } = useApp();
  const formatDate = useDateFormatter();

  const latestHba1c = [...records].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestLipid = [...lipidRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestVitaminD = [...vitaminDRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestThyroid = [...(thyroidRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestBloodPressure = [...(bloodPressureRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestWeight = [...(weightRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const isImperial = profile.unitSystem === 'imperial';
  const lipidUnit = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';
  const vitDUnit = biomarkerUnit === 'si' ? 'nmol/L' : 'ng/mL';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start">
        <div className="grid gap-2">
          <CardTitle>Comprehensive Health Report</CardTitle>
          <CardDescription>An overview of your key health metrics and trends.</CardDescription>
        </div>
         <div className="ml-auto no-print">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">HbA1c</CardTitle>
                <Droplet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {latestHba1c ? (
                    <>
                     <div className="text-2xl font-bold">{latestHba1c.value}%</div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestHba1c.date)}</p>
                    </>
                ) : <p className="text-sm text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LDL Cholesterol</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {latestLipid ? (
                    <>
                     <div className="text-2xl font-bold">{getDisplayLipidValue(latestLipid.ldl, 'ldl')} <span className="text-base font-normal text-muted-foreground">{lipidUnit}</span></div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestLipid.date)}</p>
                    </>
                ) : <p className="text-sm text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vitamin D</CardTitle>
                <Sun className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {latestVitaminD ? (
                    <>
                     <div className="text-2xl font-bold">{getDisplayVitaminDValue(latestVitaminD.value)} <span className="text-base font-normal text-muted-foreground">{vitDUnit}</span></div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestVitaminD.date)}</p>
                    </>
                ) : <p className="text-sm text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">TSH</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {latestThyroid ? (
                    <>
                     <div className="text-2xl font-bold">{latestThyroid.tsh.toFixed(2)} <span className="text-base font-normal text-muted-foreground">μIU/mL</span></div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestThyroid.date)}</p>
                    </>
                ) : <p className="text-sm text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {latestBloodPressure ? (
                    <>
                     <div className="text-2xl font-bold">{latestBloodPressure.systolic}/{latestBloodPressure.diastolic} <span className="text-base font-normal text-muted-foreground">mmHg</span></div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestBloodPressure.date)}</p>
                    </>
                ) : <p className="text-sm text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                <HeartPulse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {latestBloodPressure?.heartRate ? (
                    <>
                     <div className="text-2xl font-bold">{latestBloodPressure.heartRate} <span className="text-base font-normal text-muted-foreground">bpm</span></div>
                     <p className="text-xs text-muted-foreground">on {formatDate(latestBloodPressure.date)}</p>
                    </>
                ) : <p className="text-sm text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weight & BMI</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {latestWeight ? (
                    <>
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
                    </>
                ) : <p className="text-sm text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
          </div>
        </section>

        {records && records.length > 0 && (
          <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">HbA1c Trend</CardTitle>
              <Hba1cChart />
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
        
        {lipidRecords && lipidRecords.length > 0 && (
          <>
            <Separator />
            <section>
              <CardTitle className="text-lg mb-4">LDL Cholesterol Trend</CardTitle>
              <LdlChart />
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
