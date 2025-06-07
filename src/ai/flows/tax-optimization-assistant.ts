'use server';

/**
 * @fileOverview Provides tax optimization suggestions for expense reports by recommending Bangla translations.
 *
 * - taxOptimizationAssistant - A function that suggests Bangla translations for tax optimization.
 * - TaxOptimizationAssistantInput - The input type for the taxOptimizationAssistant function.
 * - TaxOptimizationAssistantOutput - The return type for the taxOptimizationAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaxOptimizationAssistantInputSchema = z.object({
  expenseDetails: z
    .string()
    .describe('Details of the expense, including description, amount, and location.'),
  currentTranslation: z
    .string()
    .optional()
    .describe('The current Bangla translation of the expense details, if any.'),
  expenseLocation: z
    .string()
    .describe('The location where the expense was incurred.'),
});
export type TaxOptimizationAssistantInput = z.infer<typeof TaxOptimizationAssistantInputSchema>;

const TaxOptimizationAssistantOutputSchema = z.object({
  optimizedTranslation: z
    .string()
    .describe(
      'A Bangla translation of the expense details that is optimized for tax compliance in the expense location.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of why the translation was optimized for financial compliance based on expense location.'
    ),
});
export type TaxOptimizationAssistantOutput = z.infer<typeof TaxOptimizationAssistantOutputSchema>;

export async function taxOptimizationAssistant(
  input: TaxOptimizationAssistantInput
): Promise<TaxOptimizationAssistantOutput> {
  return taxOptimizationAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taxOptimizationAssistantPrompt',
  input: {schema: TaxOptimizationAssistantInputSchema},
  output: {schema: TaxOptimizationAssistantOutputSchema},
  prompt: `You are an expert in Bangla translation and financial compliance.

  Given the following expense details, current translation, and expense location, recommend a Bangla translation that optimizes financial compliance for tax purposes.

  Expense Details: {{{expenseDetails}}}
  Current Translation: {{{currentTranslation}}}
  Expense Location: {{{expenseLocation}}}

  Provide the optimized translation and a brief explanation of why the translation was optimized for financial compliance.

  Return the response in the following JSON format:
  {
    "optimizedTranslation": "<optimized Bangla translation>",
    "reasoning": "<explanation of optimization>"
  }`,
});

const taxOptimizationAssistantFlow = ai.defineFlow(
  {
    name: 'taxOptimizationAssistantFlow',
    inputSchema: TaxOptimizationAssistantInputSchema,
    outputSchema: TaxOptimizationAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
