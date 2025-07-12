'use server';
/**
 * @fileOverview An AI assistant to help improve content.
 *
 * - getSuggestions - A function that suggests improvements for a given text.
 * - ContentAssistantInput - The input type for the getSuggestions function.
 * - ContentAssistantOutput - The return type for the getSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const ContentAssistantInputSchema = z.object({
  text: z.string().describe('The text to be improved.'),
});
export type ContentAssistantInput = z.infer<typeof ContentAssistantInputSchema>;

export const ContentAssistantOutputSchema = z.object({
    suggestions: z.array(z.string()).describe('A list of 3 improved versions of the text.'),
});
export type ContentAssistantOutput = z.infer<typeof ContentAssistantOutputSchema>;

export async function getSuggestions(input: ContentAssistantInput): Promise<ContentAssistantOutput> {
  return contentAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentAssistantPrompt',
  input: {schema: ContentAssistantInputSchema},
  output: {schema: ContentAssistantOutputSchema},
  prompt: `You are a helpful content assistant for an event organizing app. Your task is to improve the provided text for clarity, engagement, and professionalism.

The text is for an announcement or an offer related to a community bike ride event.

Please provide exactly 3 alternative versions of the following text. The suggestions should be distinct from each other.

Original text:
"{{text}}"
`,
});

const contentAssistantFlow = ai.defineFlow(
  {
    name: 'contentAssistantFlow',
    inputSchema: ContentAssistantInputSchema,
    outputSchema: ContentAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
