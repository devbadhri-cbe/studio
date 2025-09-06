
'use server';
/**
 * @fileOverview An AI flow to generate a synopsis for a medical condition, tailored to the audience.
 *
 * - getConditionSynopsis - A function that returns a synopsis for a given condition and audience.
 * - GetConditionSynopsisInput - The input type for the getConditionSynopsis function.
 * - GetConditionSynopsisOutput - The return type for the getConditionSynopsis function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GetConditionSynopsisInputSchema = z.object({
  conditionName: z.string().describe('The name of the medical condition.'),
  audience: z.enum(['patient', 'doctor']).describe("The target audience for the synopsis."),
});
export type GetConditionSynopsisInput = z.infer<typeof GetConditionSynopsisInputSchema>;

const GetConditionSynopsisOutputSchema = z.object({
  synopsis: z.string().describe('The generated synopsis for the condition.'),
});
export type GetConditionSynopsisOutput = z.infer<typeof GetConditionSynopsisOutputSchema>;


export async function getConditionSynopsis(input: GetConditionSynopsisInput): Promise<GetConditionSynopsisOutput> {
    return getConditionSynopsisFlow(input);
}

// Define a new input schema for the prompt that includes our boolean flag.
const PromptInputSchema = GetConditionSynopsisInputSchema.extend({
    isPatient: z.boolean(),
});

const prompt = ai.definePrompt({
    name: 'getConditionSynopsisPrompt',
    input: {schema: PromptInputSchema},
    output: {schema: GetConditionSynopsisOutputSchema},
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: `
      {{#if isPatient}}
      You are a compassionate health educator. Your task is to explain a medical condition to a patient in simple, clear, and reassuring language. Avoid overly technical jargon. Focus on the key aspects of the condition, what it means for them, and general lifestyle advice. Do not provide medical advice or suggest specific treatments.

      Condition: {{{conditionName}}}

      Generate a brief, easy-to-understand synopsis for the patient.
      {{else}}
      You are a medical assistant AI for clinicians. Your task is to provide a concise clinical synopsis of a medical condition, highlighting the latest updates and key information for a doctor.

      Condition: {{{conditionName}}}

      Provide a brief clinical update in bullet points, covering:
      - A brief overview of the pathophysiology.
      - Key diagnostic criteria or recent changes.
      - Important updates in management or treatment guidelines from the last 1-2 years.
      - Any new significant research findings or emerging therapies.
      {{/if}}
    `,
});

const getConditionSynopsisFlow = ai.defineFlow(
    {
        name: 'getConditionSynopsisFlow',
        inputSchema: GetConditionSynopsisInputSchema,
        outputSchema: GetConditionSynopsisOutputSchema,
    },
    async (input) => {
        // Determine the boolean flag and pass it to the prompt.
        const isPatient = input.audience === 'patient';
        const {output} = await prompt({ ...input, isPatient });
        return output!;
    }
);

