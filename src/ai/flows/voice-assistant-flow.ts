'use server';
/**
 * @fileOverview A voice assistant AI agent for booking charging slots.
 *
 * - processVoiceCommand - A function that handles voice commands for booking.
 * - VoiceCommandInput - The input type for the processVoiceCommand function.
 * - VoiceCommandOutput - The return type for the processVoiceCommand function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { chargers } from '@/lib/data';
import { format } from 'date-fns';

// In a real app, this would be a database call or a proper API.
const bookSlotTool = ai.defineTool(
  {
    name: 'bookChargingSlot',
    description: 'Books a charging slot for a user at a specific charger, date, and time.',
    inputSchema: z.object({
      chargerName: z.string().describe('The name of the charging station, e.g., "Koregaon Park Plaza, Pune".'),
      time: z.string().describe("The desired booking time in 24-hour format, e.g., '14:30' for 2:30 PM."),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
    }),
  },
  async ({ chargerName, time }) => {
    const charger = chargers.find(c => c.name.toLowerCase() === chargerName.toLowerCase());
    if (!charger) {
      return { success: false, message: `Sorry, I could not find a charger named ${chargerName}.` };
    }
    // For simplicity, we book for today. A real app would handle dates.
    const bookingDate = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const bookingStart = new Date(bookingDate.setHours(hours, minutes));

    // In a real app, you would check for availability and save the booking.
    return {
      success: true,
      message: `OK. I've booked a slot for you at ${charger.name} for today at ${format(bookingStart, "h:mm a")}.`,
    };
  }
);


const VoiceCommandInputSchema = z.object({
  command: z.string().describe('The user\'s voice command.'),
  language: z.string().describe("The language of the command, e.g., 'en-US', 'hi-IN', 'mr-IN'."),
  userName: z.string().describe("The user's name."),
});
export type VoiceCommandInput = z.infer<typeof VoiceCommandInputSchema>;

const VoiceCommandOutputSchema = z.object({
  response: z.string().describe('The assistant\'s response to the user.'),
});
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;

export async function processVoiceCommand(input: VoiceCommandInput): Promise<VoiceCommandOutput> {
  return voiceAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceAssistantPrompt',
  input: { schema: VoiceCommandInputSchema },
  output: { schema: VoiceCommandOutputSchema },
  tools: [bookSlotTool],
  prompt: `You are a friendly and efficient voice assistant for the ChargeSmart EV charging app.
The user's name is {{userName}}.
The current date is ${format(new Date(), "MMMM do, yyyy")}.
The user is speaking in {{language}}. Respond in the same language.

Your primary job is to help the user book a charging slot.
Use the 'bookChargingSlot' tool to book the slot. You need to extract the charger name and the time from the user's command.
The available chargers are: ${chargers.map(c => `'${c.name}'`).join(', ')}.

If the user's command is unclear, ask for clarification. Be conversational.

User command: "{{command}}"
`,
});

const voiceAssistantFlow = ai.defineFlow(
  {
    name: 'voiceAssistantFlow',
    inputSchema: VoiceCommandInputSchema,
    outputSchema: VoiceCommandOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { response: "I'm sorry, I didn't understand that. Could you please try again?" };
    }
    return { response: output.response };
  }
);
