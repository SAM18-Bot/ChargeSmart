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
    .describe('An array of available charging station IDs.'),
  pricing: z.number().describe('The current price per kWh at available charging stations.'),
  chargerPower: z.number().describe('The power of the charger in kW.'),
});
export type OptimizeChargingScheduleInput = z.infer<
  typeof OptimizeChargingScheduleInputSchema
>;

const OptimizeChargingScheduleOutputSchema = z.object({
  scheduleSuggestion: z.string().describe('The AI-optimized charging schedule suggestion, including which charger to use.'),
  costEstimate: z.number().describe('Estimated charging cost based on the suggested schedule.'),
  estimatedChargingTime: z
    .string()
    .describe('Estimated charging time based on the suggested schedule (e.g., \'45 minutes\').'),
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
  prompt: `You are an AI assistant specializing in optimizing EV charging schedules. Your goal is to provide a practical, cost-effective, and time-efficient charging plan.

Analyze the user's EV model, current battery percentage, available charging stations, and pricing.

Key Information:
- EV Model: {{{evModel}}}
- Current Battery Percentage: {{{batteryPercentage}}}%
- Available Charging Station IDs: {{#each chargingStationOptions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Price per kWh: ₹{{{pricing}}}
- Charger Power: {{{chargerPower}}} kW

Your Task:
1.  Suggest the best charging station from the available options.
2.  Recommend a target battery percentage. It is often not optimal to charge to 100%. Suggest charging to 80% or 90% for efficiency, unless the user's current percentage is already high.
3.  Calculate the estimated time required for the charge. The formula is: Time (hours) = (kWh needed) / (Charger Power). Present the result in minutes.
4.  Calculate the estimated total cost for the session.
5.  Combine this into a concise, actionable "scheduleSuggestion". Be specific and provide your reasoning.

Example Response:
- scheduleSuggestion: "I recommend charging at station CZ-002. To save time and for battery health, you should charge up to 85%, which will give you ample range."
- costEstimate: 450.50
- estimatedChargingTime: "Approx. 55 minutes"
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
