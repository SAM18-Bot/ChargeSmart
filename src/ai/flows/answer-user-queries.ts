
'use server';

/**
 * @fileOverview Implements a Genkit flow for answering user queries related to EV charging, charger availability,
 * and app usage using an OpenAI chatbot.
 *
 * - answerUserQuery - A function that accepts a user query and returns an answer from the OpenAI chatbot.
 * - AnswerUserQueryInput - The input type for the answerUserQuery function.
 * - AnswerUserQueryOutput - The return type for the answerUserQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerUserQueryInputSchema = z.object({
  query: z.string().describe('The user query about EV charging, charger availability, or app usage.'),
});
export type AnswerUserQueryInput = z.infer<typeof AnswerUserQueryInputSchema>;

const AnswerUserQueryOutputSchema = z.object({
  answer: z.string().describe('The answer from the OpenAI chatbot.'),
});
export type AnswerUserQueryOutput = z.infer<typeof AnswerUserQueryOutputSchema>;

export async function answerUserQuery(input: AnswerUserQueryInput): Promise<AnswerUserQueryOutput> {
  return answerUserQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerUserQueryPrompt',
  model: 'googleai/gemini-2.0-flash-latest',
  input: {schema: AnswerUserQueryInputSchema},
  output: {schema: AnswerUserQueryOutputSchema},
  prompt: `You are a chatbot designed to answer user queries related to EV charging, charger availability, and app usage.

  User Query: {{{query}}}
  `,
});

const answerUserQueryFlow = ai.defineFlow(
  {
    name: 'answerUserQueryFlow',
    inputSchema: AnswerUserQueryInputSchema,
    outputSchema: AnswerUserQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
