'use server';

/**
 * @fileOverview This flow extracts HbA1c data and date from a lab result screenshot, verifies the user's name,
 * and returns the extracted information.
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
  name: z.string().describe('The name of the user to verify against the lab result.'),
});
export type LabResultUploadInput = z.infer<typeof LabResultUploadInputSchema>;

const LabResultUploadOutputSchema = z.object({
  hba1cResult: z.string().describe('The HbA1c result extracted from the lab result.'),
  date: z.string().describe('The date the lab result was taken.'),
  nameVerified: z.boolean().describe('Whether the name on the lab result matches the user provided name.'),
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

You will extract the HbA1c result and the date the lab result was taken from the image. You will also verify that the name on the lab result matches the user provided name.

Return the extracted HbA1c result, the date, and whether the name was verified.

Lab Result Image: {{media url=photoDataUri}}
User Name: {{{name}}}`,
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
