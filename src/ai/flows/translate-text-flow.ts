'use server';
/**
 * @fileOverview An AI flow to translate text to a specified language.
 *
 * - translateText - A function that translates a list of strings.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  texts: z.array(z.string()).describe('The list of text strings to translate.'),
  targetLanguage: z.string().describe('The target language to translate the text into (e.g., "Spanish", "French", "Hindi").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedTexts: z.array(z.string()).describe('The list of translated text strings.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
    return translateTextFlow(input);
}

const prompt = ai.definePrompt({
    name: 'translateTextPrompt',
    input: {schema: TranslateTextInputSchema},
    output: {schema: TranslateTextOutputSchema},
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: `
        You are a highly skilled translator. Your task is to translate the following list of texts into the specified target language.

        Target Language: {{{targetLanguage}}}

        Texts to Translate:
        {{#each texts}}
        - "{{{this}}}"
        {{/each}}

        Please provide the translations for each text in the same order. Ensure the translation is accurate, natural-sounding, and maintains the original meaning and tone.
    `,
});

const translateTextFlow = ai.defineFlow(
    {
        name: 'translateTextFlow',
        inputSchema: TranslateTextInputSchema,
        outputSchema: TranslateTextOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
