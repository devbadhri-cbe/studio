
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const safetySettings = [
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
   {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
];

export const ai = genkit({
    plugins: [
        googleAI({
            apiVersion: 'v1beta',
            safetySettings,
        }),
    ],
});
