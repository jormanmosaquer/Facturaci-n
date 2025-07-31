// VATValidator flow

'use server';

/**
 * @fileOverview A VAT validation AI agent.
 *
 * - validateVat - A function that handles the VAT validation process.
 * - ValidateVatInput - The input type for the validateVat function.
 * - ValidateVatOutput - The return type for the validateVat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateVatInputSchema = z.object({
  vatNumber: z
    .string()
    .describe('The Value Added Tax identification number to validate.'),
});
export type ValidateVatInput = z.infer<typeof ValidateVatInputSchema>;

const ValidateVatOutputSchema = z.object({
  isValid: z.boolean().describe('Whether or not the VAT number is valid.'),
  validationDetails: z
    .string()
    .describe('Details about the validation process and any errors.'),
});
export type ValidateVatOutput = z.infer<typeof ValidateVatOutputSchema>;

export async function validateVat(input: ValidateVatInput): Promise<ValidateVatOutput> {
  return validateVatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateVatPrompt',
  input: {schema: ValidateVatInputSchema},
  output: {schema: ValidateVatOutputSchema},
  prompt: `You are an AI assistant specializing in validating Value Added Tax (VAT) identification numbers. You will receive a VAT number as input and determine if it is valid based on general VAT validation rules and patterns. Consider common VAT formats and structures.

  You will make a determination as to whether the VAT number is valid or not, and set the isValid output field appropriately. Provide details about the validation in the validationDetails output field, including any errors or inconsistencies found.

  VAT Number: {{{vatNumber}}}`,
});

const validateVatFlow = ai.defineFlow(
  {
    name: 'validateVatFlow',
    inputSchema: ValidateVatInputSchema,
    outputSchema: ValidateVatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
