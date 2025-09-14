
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const safetySettings = [
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
];

export const ai = genkit({
    plugins: [
        googleAI({
            safetySettings,
        }),
    ],
    logLevel: 'debug',
    enableTracing: true,
});
