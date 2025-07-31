"use server";

import {
  validateVat as validateVatFlow,
  type ValidateVatInput,
  type ValidateVatOutput,
} from "@/ai/flows/vat-validator";

export async function validateVatAction(
  input: ValidateVatInput
): Promise<{ success: true; data: ValidateVatOutput } | { success: false; error: string }> {
  try {
    const result = await validateVatFlow(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("VAT validation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Fallo al validar el IVA: ${errorMessage}` };
  }
}
