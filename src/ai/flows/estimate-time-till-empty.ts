'use server';

/**
 * @fileOverview Estimates the time until a charging station is free using an LLM-powered tool.
 *
 * - estimateTimeTillEmpty - A function that estimates the time until a charging station is free.
 * - EstimateTimeTillEmptyInput - The input type for the estimateTimeTillEmpty function.
 * - EstimateTimeTillEmptyOutput - The return type for the estimateTimeTillEmpty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateTimeTillEmptyInputSchema = z.object({
  chargerId: z.string().describe('The ID of the charging station.'),
  currentKwh: z.number().describe('The current kWh remaining in the charging session.'),
  vehicleModel: z.string().describe('The EV model connected to the charger.'),
  batteryPercentage: z.number().describe('The current battery percentage of the EV.'),
  reservedKwh: z.number().describe('The kWh reserved for the current charging session.'),
});
export type EstimateTimeTillEmptyInput = z.infer<typeof EstimateTimeTillEmptyInputSchema>;

const EstimateTimeTillEmptyOutputSchema = z.object({
  estimatedTimeTillEmpty: z.string().describe('The estimated time until the charging station is free (e.g., \'30 minutes\').'),
});
export type EstimateTimeTillEmptyOutput = z.infer<typeof EstimateTimeTillEmptyOutputSchema>;

export async function estimateTimeTillEmpty(input: EstimateTimeTillEmptyInput): Promise<EstimateTimeTillEmptyOutput> {
  return estimateTimeTillEmptyFlow(input);
}

const estimateTimeTillEmptyPrompt = ai.definePrompt({
  name: 'estimateTimeTillEmptyPrompt',
  input: {schema: EstimateTimeTillEmptyInputSchema},
  output: {schema: EstimateTimeTillEmptyOutputSchema},
  prompt: `You are an AI assistant that estimates the time until an EV charging station will be free.

  Consider the following information:
  - Charger ID: {{{chargerId}}}
  - Current kWh remaining: {{{currentKwh}}} kWh
  - EV Vehicle Model: {{{vehicleModel}}}
  - Current Battery Percentage: {{{batteryPercentage}}}%
  - Reserved kWh: {{{reservedKwh}}} kWh

  Estimate the time until the charging station will be free. Provide your answer in a human-readable format (e.g., \'30 minutes\').
  Ensure that your estimate is realistic and takes into account the vehicle model, battery percentage, and reserved kWh.
  `,
});

const estimateTimeTillEmptyFlow = ai.defineFlow(
  {
    name: 'estimateTimeTillEmptyFlow',
    inputSchema: EstimateTimeTillEmptyInputSchema,
    outputSchema: EstimateTimeTillEmptyOutputSchema,
  },
  async input => {
    const {output} = await estimateTimeTillEmptyPrompt(input);
    return output!;
  }
);
