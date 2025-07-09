// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent that improves text suggestions for clarity and engagement.
 *
 * - improveText - A function that enhances the clarity and engagement of input text.
 * - ImproveTextInput - The input type for the improveText function.
 * - ImproveTextOutput - The return type for the improveText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveTextInputSchema = z.object({
  text: z
    .string()
    .describe('The text to be improved for clarity and engagement.'),
});
export type ImproveTextInput = z.infer<typeof ImproveTextInputSchema>;

const ImproveTextOutputSchema = z.object({
  improvedText: z
    .string()
    .describe('The improved text with enhanced clarity and engagement.'),
});
export type ImproveTextOutput = z.infer<typeof ImproveTextOutputSchema>;

export async function improveText(input: ImproveTextInput): Promise<ImproveTextOutput> {
  return improveTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveTextPrompt',
  input: {schema: ImproveTextInputSchema},
  output: {schema: ImproveTextOutputSchema},
  prompt: `You are an AI assistant specializing in improving text for clarity and engagement.
  Please review the following text and suggest improvements to enhance its clarity and make it more engaging for the target audience.
  Provide the improved text as output.
  
  Original Text: {{{text}}}`,
});

const improveTextFlow = ai.defineFlow(
  {
    name: 'improveTextFlow',
    inputSchema: ImproveTextInputSchema,
    outputSchema: ImproveTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
