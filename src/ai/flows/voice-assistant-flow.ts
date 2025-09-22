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
import wav from 'wav';

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
  }

const VoiceCommandInputSchema = z.object({
  command: z.string().describe('The user\'s voice command.'),
  language: z.string().describe("The language of the command, e.g., 'en-US', 'hi-IN', 'mr-IN'."),
  userName: z.string().describe("The user's name."),
});
export type VoiceCommandInput = z.infer<typeof VoiceCommandInputSchema>;

const VoiceCommandOutputSchema = z.object({
    response: z.string().describe('The assistant\'s response to the user.'),
    audio: z.string().optional().describe('The base64 encoded WAV audio of the response.'),
});
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;

export async function processVoiceCommand(input: VoiceCommandInput): Promise<VoiceCommandOutput> {
  return voiceAssistantFlow(input);
}

const TextToSpeechInputSchema = z.object({
    text: z.string(),
});
type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
    audio: z.string(),
});
type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    const { media } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-preview-tts',
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
            },
        },
        prompt: input.text,
    });
    if (!media) {
        throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    return {
        audio: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
}


const prompt = ai.definePrompt({
  name: 'voiceAssistantPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  output: { schema: VoiceCommandOutputSchema },
  prompt: `You are a friendly and highly capable voice assistant for the ChargeSmart EV charging app.
Your role is to answer user questions about EV charging, charger locations, and how to use the app.
You should not perform any actions like booking or payments. Guide the user on how they can do it themselves within the app.

The user's name is {{userName}}.
The current date is ${format(new Date(), "MMMM do, yyyy")}.
The user is speaking in {{language}}. Respond in the same language.

Available chargers are: ${chargers.map(c => `'${c.name}'`).join(', ')}.
Available EV models in the app are: ${evs.map(e => `'${e.model}'`).join(', ')}.

Be helpful and conversational.

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

    if (!output?.response) {
      return {
        response: "I'm sorry, I didn't understand that. Could you please try again?",
      };
    }
    
    const audioResponse = await textToSpeech({ text: output.response });

    return {
        response: output.response,
        audio: audioResponse.audio,
    };
  }
);
