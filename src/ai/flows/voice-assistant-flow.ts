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
import { chargers, evs } from '@/lib/data';
import { format } from 'date-fns';

const PRICE_PER_KWH = 18;

// This tool is now for the AI to *decide* which action to take.
// The actual logic is handled by the flow itself, which returns an action to the client.
const selectBookingActionTool = ai.defineTool(
  {
    name: 'initiateChargingAction',
    description: 'Initiates a charging or booking action based on user command. The flow will return the final action to the client.',
    inputSchema: z.object({
        chargerName: z.string().describe('The name of the charging station, extracted from the user\'s command (e.g., "Koregaon Park Plaza, Pune").'),
        actionType: z.enum(['SMART_CHARGE', 'DIRECT_CHARGE', 'BOOK_SLOT']).describe('The type of action the user wants to take.'),
        details: z.object({
            kwh: z.number().optional().describe('For DIRECT_CHARGE, the amount of kWh to charge.'),
            evModel: z.string().optional().describe('For SMART_CHARGE, the user\'s EV model.'),
            batteryPercentage: z.number().optional().describe('For SMART_CHARGE, the current battery percentage.'),
            time: z.string().optional().describe("For BOOK_SLOT, the desired booking time in 24-hour format (e.g., '14:30')."),
        }).describe('The details for the chosen action.'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string().describe('A confirmation message for the assistant to use in its response.'),
    }),
  },
  async (input) => {
    // This tool's purpose is to structure the AI's decision.
    // The flow will interpret this and create the action for the frontend.
    // We return a simple success message that the AI can use in its response.
    return {
      success: true,
      message: `I am preparing to ${input.actionType.replace('_', ' ').toLowerCase()} for you.`,
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
    action: z.object({
        type: z.enum(['INITIATE_PAYMENT', 'BOOK_SLOT_CONFIRMED', 'REQUIRE_MORE_INFO', 'NONE']),
        payload: z.any().optional(),
    }).describe('An action for the client to perform.'),
});
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;

export async function processVoiceCommand(input: VoiceCommandInput): Promise<VoiceCommandOutput> {
  return voiceAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceAssistantPrompt',
  tools: [selectBookingActionTool],
  prompt: `You are a friendly and highly capable voice assistant for the ChargeSmart EV charging app.
The user's name is {{userName}}.
The current date is ${format(new Date(), "MMMM do, yyyy")}.
The user is speaking in {{language}}. Respond in the same language.

Your primary job is to help the user book a charging session. You have three main capabilities, executed via the 'initiateChargingAction' tool:
1.  **Smart Charge**: If the user wants to charge their car to full, ask for their EV model and current battery percentage. The available EV models are: ${evs.map(e => `'${e.model}'`).join(', ')}.
2.  **Direct kWh Charge**: If the user specifies a number of kWh to charge, use that directly.
3.  **Book a Future Slot**: If the user specifies a time, book a slot for them.

Use the 'initiateChargingAction' tool to finalize the user's request.
- First, you MUST determine the charger location from the user's command. Available chargers are: ${chargers.map(c => `'${c.name}'`).join(', ')}.
- If critical information is missing (e.g., EV model for a smart charge), ask the user for it in a friendly, conversational way. Do NOT call the tool until you have all the required information for the selected action.
- Once you have all the information, call the tool with the correct 'actionType' and 'details'.
- Formulate your final response based on the tool's output. Be conversational and confirm the action you are taking.

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
    const genkitResponse = await prompt(input);
    const output = genkitResponse.output;

    let responseText: string;
    let action: VoiceCommandOutput['action'] = { type: 'NONE' };

    if (!output) {
      responseText = "I'm sorry, I didn't understand that. Could you please try again?";
      action = { type: 'NONE' };
    } else if (output.toolRequests && output.toolRequests.length > 0) {
        const toolInput = output.toolRequests[0].input as any;
        const charger = chargers.find(c => c.name.toLowerCase() === toolInput.chargerName.toLowerCase());

        if (!charger) {
            responseText = `I'm sorry, I couldn't find the charger named "${toolInput.chargerName}". Please try again with one of the available chargers.`;
            action = { type: 'NONE' };
        } else {
            switch(toolInput.actionType) {
                case 'DIRECT_CHARGE': {
                    const kwh = toolInput.details.kwh;
                    const cost = parseFloat((kwh * PRICE_PER_KWH).toFixed(2));
                    responseText = `Got it. Starting a direct charge of ${kwh} kWh at ${charger.name}. Please complete the payment.`;
                    action = {
                        type: 'INITIATE_PAYMENT',
                        payload: { charger, type: 'direct', kwh, cost }
                    };
                    break;
                }
                case 'SMART_CHARGE': {
                    const { evModel, batteryPercentage } = toolInput.details;
                    const selectedEVObject = evs.find(ev => ev.model.toLowerCase() === evModel.toLowerCase());
                    if (!selectedEVObject) {
                        responseText = `Sorry, I don't recognize the EV model "${evModel}".`;
                        action = { type: 'NONE' };
                    } else {
                        const kwhNeeded = parseFloat((((100 - batteryPercentage) / 100) * selectedEVObject.batteryCapacity).toFixed(2));
                        const cost = parseFloat((kwhNeeded * PRICE_PER_KWH).toFixed(2));
                        responseText = `Okay, starting a smart charge for your ${evModel} at ${charger.name}. That will be approximately ${kwhNeeded} kWh. Please complete the payment.`;
                        action = {
                            type: 'INITIATE_PAYMENT',
                            payload: { charger, type: 'smart', kwh: kwhNeeded, cost, evModel, batteryPercentage }
                        };
                    }
                    break;
                }
                case 'BOOK_SLOT': {
                     const [hours, minutes] = toolInput.details.time.split(':').map(Number);
                     const bookingDate = new Date();
                     const bookingStart = new Date(bookingDate.setHours(hours, minutes));
                     responseText = `Confirmed! I've booked a slot for you at ${charger.name} for today at ${format(bookingStart, "h:mm a")}.`;
                     action = {
                        type: 'BOOK_SLOT_CONFIRMED',
                        payload: { charger, time: toolInput.details.time, date: new Date() }
                    };
                    break;
                }
                default:
                    responseText = "I'm not sure how to handle that action. Could you try again?";
                    action = { type: 'NONE' };
                    break;
            }
        }
    } else {
        // If we are here, the model is likely asking for more info or just chatting.
        responseText = output.message.content.find(p => p.text)?.text || "...";
        action = { type: 'REQUIRE_MORE_INFO' };
    }

    return {
        response: responseText,
        action: action,
    };
  }
);
