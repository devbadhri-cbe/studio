
'use server';

/**
 * @fileOverview This flow extracts HbA1c, Lipid Panel, Vitamin D, and Thyroid data from a lab result screenshot.
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
  }).optional().describe('The lipid panel results extracted.'),
  vitaminDValue: z.number().optional().describe('The Vitamin D result extracted from the lab result (as a number).'),
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

Then, scan the document for the following biomarkers. If a biomarker is present, extract its value. If it's not present, leave the field empty.
- HbA1c (as a percentage value)
- Lipid Panel (LDL, HDL, Triglycerides, Total Cholesterol)
- Vitamin D (as a numerical value)
- Thyroid Panel (TSH, T3, T4)
- Blood Pressure (Systolic, Diastolic) and Heart Rate (Pulse)

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
