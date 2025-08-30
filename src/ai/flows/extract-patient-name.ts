
'use server';

/**
 * @fileOverview This flow extracts the patient's name from a lab result screenshot.
 *
 * - extractPatientName - A function that handles the patient name extraction.
 * - ExtractPatientNameInput - The input type for the extractPatientName function.
 * - ExtractPatientNameOutput - The return type for the extractPatientName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPatientNameInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the lab result as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type ExtractPatientNameInput = z.infer<typeof ExtractPatientNameInputSchema>;

const ExtractPatientNameOutputSchema = z.object({
  patientName: z.string().describe('The full name of the patient extracted from the lab result.'),
});
export type ExtractPatientNameOutput = z.infer<typeof ExtractPatientNameOutputSchema>;


export async function extractPatientName(input: ExtractPatientNameInput): Promise<ExtractPatientNameOutput> {
  return extractPatientNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPatientNamePrompt',
  input: {schema: ExtractPatientNameInputSchema},
  output: {schema: ExtractPatientNameOutputSchema},
  prompt: `You are an expert at Optical Character Recognition (OCR) specializing in medical documents.

Your task is to find and extract the full name of the patient from the provided lab result image. The name is usually at the top of the document, but it could be anywhere. Find the most likely candidate for the patient's name and return it.

Lab Result Image: {{media url=photoDataUri}}`,
});

const extractPatientNameFlow = ai.defineFlow(
  {
    name: 'extractPatientNameFlow',
    inputSchema: ExtractPatientNameInputSchema,
    outputSchema: ExtractPatientNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
