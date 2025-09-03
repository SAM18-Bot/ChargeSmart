'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing EV charging schedules.
 *
 * - optimizeChargingSchedule - A function that takes EV model, battery percentage, charging station options, and pricing to suggest the most cost-effective and convenient charging schedule.
 * - OptimizeChargingScheduleInput - The input type for the optimizeChargingSchedule function.
 * - OptimizeChargingScheduleOutput - The return type for the optimizeChargingSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeChargingScheduleInputSchema = z.object({
  evModel: z.string().describe('The electric vehicle model.'),
  batteryPercentage: z.number().describe('The current battery percentage of the EV.'),
  chargingStationOptions: z
    .array(z.string())
    .describe('An array of available charging station options.'),
  pricing: z.number().describe('The current price per kWh at available charging stations.'),
});
export type OptimizeChargingScheduleInput = z.infer<
  typeof OptimizeChargingScheduleInputSchema
>;

const OptimizeChargingScheduleOutputSchema = z.object({
  scheduleSuggestion: z.string().describe('The AI-optimized charging schedule suggestion.'),
  costEstimate: z.number().describe('Estimated charging cost based on the suggested schedule.'),
  estimatedChargingTime: z
    .string()
    .describe('Estimated charging time based on the suggested schedule.'),
});

export type OptimizeChargingScheduleOutput = z.infer<
  typeof OptimizeChargingScheduleOutputSchema
>;

export async function optimizeChargingSchedule(
  input: OptimizeChargingScheduleInput
): Promise<OptimizeChargingScheduleOutput> {
  return optimizeChargingScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeChargingSchedulePrompt',
  input: {schema: OptimizeChargingScheduleInputSchema},
  output: {schema: OptimizeChargingScheduleOutputSchema},
  prompt: `You are an AI assistant specializing in optimizing EV charging schedules. Analyze the user's EV model, current battery percentage, available charging station options, and pricing to suggest the most cost-effective and convenient charging schedule.

  EV Model: {{{evModel}}}
  Battery Percentage: {{{batteryPercentage}}}
  Charging Station Options: {{#each chargingStationOptions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Pricing: {{{pricing}}}

  Based on this information, provide an optimal charging schedule, estimate the total cost, and provide the estimated charging time.
  Be specific with your recommendations and include rationale for your decision.
  Ensure the schedule is both cost-effective and convenient for the user.
  `,
});

const optimizeChargingScheduleFlow = ai.defineFlow(
  {
    name: 'optimizeChargingScheduleFlow',
    inputSchema: OptimizeChargingScheduleInputSchema,
    outputSchema: OptimizeChargingScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
