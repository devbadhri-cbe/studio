
'use server';
/**
 * @fileOverview An AI flow to extract the patient's name from a lab report.
 *
 * - extractPatientName - A function that extracts only the patient's name from an image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PatientNameInputSchema = z.object({
  photoDataUri: z.string().describe("A photo or PDF of a lab report, as a data URI."),
});

const PatientNameOutputSchema = z.object({
  patientName: z.string().optional().describe("The full name of the patient as it appears on the lab report."),
});

export type PatientNameInput = z.infer<typeof PatientNameInputSchema>;
export type PatientNameOutput = z.infer<typeof PatientNameOutputSchema>;


export async function extractPatientName(input: PatientNameInput): Promise<PatientNameOutput> {
  return extractPatientNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPatientNamePrompt',
  input: { schema: PatientNameInputSchema },
  output: { schema: PatientNameOutputSchema },
  prompt: `You are a specialized medical data entry assistant. Your task is to analyze the provided document and extract ONLY the patient's full name.

Do not extract any other information. If no name is found, do not return anything.

Document to analyze: {{media url=photoDataUri}}`,
});

const extractPatientNameFlow = ai.defineFlow(
  {
    name: 'extractPatientNameFlow',
    inputSchema: PatientNameInputSchema,
    outputSchema: PatientNameOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to extract a name from the document.');
    }
    return output;
  }
);
