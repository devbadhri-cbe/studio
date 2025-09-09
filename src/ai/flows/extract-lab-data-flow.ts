
'use server';
/**
 * @fileOverview An AI flow to extract structured data from lab reports.
 *
 * - extractLabData - A function that extracts biomarker data from a lab report image.
 * - LabDataExtractionInput - The input type for the extractLabData function.
 * - LabDataExtractionOutput - The return type for the extractLabData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const LabDataExtractionInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a lab report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type LabDataExtractionInput = z.infer<typeof LabDataExtractionInputSchema>;

const LabDataExtractionOutputSchema = z.object({
  hba1c: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      value: z.number().describe('The HbA1c value as a percentage.'),
    })
    .optional()
    .describe('Hemoglobin A1c test result.'),
  fastingBloodGlucose: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      value: z.number().describe('The fasting blood glucose value in mg/dL.'),
    })
    .optional()
    .describe('Fasting Blood Glucose test result.'),
  vitaminD: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      value: z.number().describe('The Vitamin D (25-OH) value.'),
      units: z.string().describe('The units for the Vitamin D value (e.g., ng/mL or nmol/L).'),
    })
    .optional()
    .describe('Vitamin D test result.'),
  thyroid: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      tsh: z.number().optional().describe('Thyroid-Stimulating Hormone value.'),
      t3: z.number().optional().describe('Triiodothyronine value.'),
      t4: z.number().optional().describe('Thyroxine value.'),
    })
    .optional()
    .describe('Thyroid panel results.'),
  bloodPressure: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      systolic: z.number().describe('The systolic blood pressure value.'),
      diastolic: z.number().describe('The diastolic blood pressure value.'),
      heartRate: z.number().optional().describe('The heart rate in beats per minute.'),
    })
    .optional()
    .describe('Blood pressure reading.'),
  hemoglobin: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      hemoglobin: z.number().describe('The hemoglobin value in g/dL.'),
    })
    .optional()
    .describe('Hemoglobin test result.'),
  lipidPanel: z
    .object({
      date: z.string().describe('The date of the test in YYYY-MM-DD format.'),
      totalCholesterol: z.number().optional().describe('Total cholesterol value in mg/dL.'),
      ldl: z.number().optional().describe('LDL cholesterol value in mg/dL.'),
      hdl: z.number().optional().describe('HDL cholesterol value in mg/dL.'),
      triglycerides: z.number().optional().describe('Triglycerides value in mg/dL.'),
    })
    .optional()
    .describe('Full lipid panel results.'),
});
export type LabDataExtractionOutput = z.infer<typeof LabDataExtractionOutputSchema>;

export async function extractLabData(input: LabDataExtractionInput): Promise<LabDataExtractionOutput> {
  return extractLabDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLabDataPrompt',
  input: { schema: LabDataExtractionInputSchema },
  output: { schema: LabDataExtractionOutputSchema },
  prompt: `You are a specialized medical data entry assistant. Your task is to accurately extract biomarker data from an image of a patient's lab report.

Analyze the provided image and extract any of the following biomarkers. If a biomarker is not present, do not include it in the output. For each biomarker found, you MUST extract the date of the test. Ensure the date is in YYYY-MM-DD format.

- HbA1c (%)
- Fasting Blood Glucose (mg/dL)
- Vitamin D (25-OH) (value and units)
- Thyroid Panel (TSH, T3, T4)
- Blood Pressure (Systolic, Diastolic, Heart Rate)
- Hemoglobin (g/dL)
- Lipid Panel (Total Cholesterol, LDL, HDL, Triglycerides, all in mg/dL)

Image to analyze: {{media url=photoDataUri}}`,
});

const extractLabDataFlow = ai.defineFlow(
  {
    name: 'extractLabDataFlow',
    inputSchema: LabDataExtractionInputSchema,
    outputSchema: LabDataExtractionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
