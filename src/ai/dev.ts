
'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/lab-result-upload.ts';
import '@/ai/flows/personalized-insights.ts';
import '@/ai/flows/suggest-icd-code.ts';
import '@/ai/flows/drug-interaction-check.ts';
import '@/ai/flows/standardize-medication.ts';
import '@/ai/flows/medication-synopsis.ts';
