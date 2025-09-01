
'use server';

/**
 * @fileOverview This flow extracts biomarker data from a lab result screenshot.
 *
 * - labResultUpload - A function that handles the lab result upload process.
 * - LabResultUploadInput - The input type for the labResultUpload function.
 * - LabResultUploadOutput - The return type for the labResultUpload function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LabResultUploadInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the lab result as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type LabResultUploadInput = z.infer<typeof LabResultUploadInputSchema>;

const LabResultUploadOutputSchema = z.object({
  date: z.string().describe('The date the lab result was taken (YYYY-MM-DD format).'),
  hba1cValue: z.number().optional().describe('The HbA1c result extracted from the lab result (as a number).'),
  lipidPanel: z.object({
    ldl: z.number().optional().describe('LDL cholesterol level.'),
    hdl: z.number().optional().describe('HDL cholesterol level.'),
    triglycerides: z.number().optional().describe('Triglycerides level.'),
    total: z.number().optional().describe('Total cholesterol level.'),
    units: z.enum(['mg/dL', 'mmol/L']).optional().describe('The units for the lipid panel results (mg/dL or mmol/L).'),
  }).optional().describe('The lipid panel results extracted.'),
  vitaminDValue: z.number().optional().describe('The Vitamin D result extracted from the lab result (as a number).'),
  vitaminDUnits: z.enum(['ng/mL', 'nmol/L']).optional().describe('The units for the Vitamin D result (ng/mL or nmol/L).'),
  thyroidPanel: z.object({
      tsh: z.number().optional().describe('TSH level.'),
      t3: z.number().optional().describe('T3 level.'),
      t4: z.number().optional().describe('T4 level.'),
  }).optional().describe('The thyroid panel results extracted.'),
  bloodPressure: z.object({
      systolic: z.number().optional().describe('Systolic blood pressure.'),
      diastolic: z.number().optional().describe('Diastolic blood pressure.'),
      heartRate: z.number().optional().describe('Heart rate (pulse) in beats per minute.'),
  }).optional().describe('The blood pressure results extracted.'),
  renalPanel: z.object({
      serumCreatinine: z.number().optional().describe('Serum Creatinine level.'),
      serumCreatinineUnits: z.enum(['mg/dL', 'umol/L']).optional().describe('The units for Serum Creatinine.'),
      bun: z.number().optional().describe('Blood Urea Nitrogen (BUN) level in mg/dL.'),
      egfr: z.number().optional().describe('eGFR (estimated Glomerular Filtration Rate).'),
      uacr: z.number().optional().describe('UACR (Urine Albumin-to-Creatinine Ratio).'),
  }).optional().describe('The renal panel results extracted.'),
  electrolytes: z.object({
      sodium: z.number().optional().describe('Sodium (Na) level in mEq/L.'),
      potassium: z.number().optional().describe('Potassium (K) level in mEq/L.'),
      chloride: z.number().optional().describe('Chloride (Cl) level in mEq/L.'),
      bicarbonate: z.number().optional().describe('Bicarbonate (HCO3-) level in mEq/L.'),
  }).optional().describe('The electrolyte panel results extracted.'),
  mineralBone: z.object({
    calcium: z.number().optional().describe('Calcium level in mg/dL.'),
    phosphorus: z.number().optional().describe('Phosphorus level in mg/dL.'),
    pth: z.number().optional().describe('Parathyroid Hormone (PTH) level in pg/mL.'),
  }).optional().describe('Mineral and bone disease markers.'),
  hemoglobin: z.number().optional().describe('Hemoglobin (Hb or Hgb) level in g/dL.'),
  albumin: z.number().optional().describe('Serum Albumin level in g/dL.'),
});
export type LabResultUploadOutput = z.infer<typeof LabResultUploadOutputSchema>;


export async function labResultUpload(input: LabResultUploadInput): Promise<LabResultUploadOutput> {
  return labResultUploadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'labResultUploadPrompt',
  input: {schema: LabResultUploadInputSchema},
  output: {schema: LabResultUploadOutputSchema},
  prompt: `You are an expert medical assistant specializing in extracting information from lab results.

First, extract the test date. It MUST be formatted as YYYY-MM-DD. If you cannot find a date, leave the field empty.

Then, scan the document for the following biomarkers. For each biomarker, extract its value AND the units of measurement if available.
- HbA1c (as a percentage value, units are always '%')
- Lipid Panel (LDL, HDL, Triglycerides, Total Cholesterol). Common units are mg/dL or mmol/L.
- Vitamin D (as a numerical value). Common units are ng/mL or nmol/L.
- Thyroid Panel (TSH, T3, T4). Extract the numeric values only. Do not extract the units.
- Blood Pressure (Systolic, Diastolic) and Heart Rate (Pulse). Units are typically mmHg and bpm. Ignore these units for extraction.
- Renal Panel (Serum Creatinine, eGFR, UACR, BUN). Units for BUN are typically mg/dL.
- Electrolytes (Sodium/Na, Potassium/K, Chloride/Cl, Bicarbonate/HCO3-). Units are typically mEq/L.
- Mineral & Bone Markers: Calcium (Ca) in mg/dL, Phosphorus (PO4) in mg/dL, and Parathyroid Hormone (PTH) in pg/mL.
- Hemoglobin (Hb or Hgb). Unit is g/dL.
- Serum Albumin. Unit is g/dL.

Return the extracted information in the specified format.

Lab Result Image: {{media url=photoDataUri}}`,
});

const labResultUploadFlow = ai.defineFlow(
  {
    name: 'labResultUploadFlow',
    inputSchema: LabResultUploadInputSchema,
    outputSchema: LabResultUploadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
