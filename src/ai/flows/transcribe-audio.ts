// Use server directive is required for Genkit flows.
'use server';
/**
 * @fileOverview Transcribes audio from a waiter-customer conversation in real-time.
 *
 * - transcribeAudio - A function that handles the audio transcription process.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioUrl: z.string().describe('The URL of the audio file to transcribe.'),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: {
    schema: z.object({
      audioUrl: z.string().describe('The URL of the audio file to transcribe.'),
    }),
  },
  output: {
    schema: z.object({
      transcription: z.string().describe('The transcribed text from the audio.'),
    }),
  },
  prompt: `You are a transcription service. Please transcribe the audio from the following URL:\n\nAudio URL: {{audioUrl}}`,
});

const transcribeAudioFlow = ai.defineFlow<
  typeof TranscribeAudioInputSchema,
  typeof TranscribeAudioOutputSchema
>(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    const {output} = await transcribeAudioPrompt(input);
    return output!;
  }
);
