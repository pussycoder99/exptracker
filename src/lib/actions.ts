'use server';

import { taxOptimizationAssistant } from '@/ai/flows/tax-optimization-assistant';
import type { TaxOptimizationAssistantInput, TaxOptimizationAssistantOutput } from '@/ai/flows/tax-optimization-assistant';
import type { Expense } from '@/lib/types';

export async function runTaxOptimization(
  input: TaxOptimizationAssistantInput
): Promise<TaxOptimizationAssistantOutput> {
  try {
    const result = await taxOptimizationAssistant(input);
    return result;
  } catch (error) {
    console.error('Error in taxOptimizationAssistant flow:', error);
    throw new Error('Failed to get tax optimization suggestions.');
  }
}

export async function saveExpensesToFirebase(expenses: Expense[]): Promise<{ success: boolean; message: string }> {
  // Placeholder for Firebase integration
  console.log('Saving expenses to Firebase (placeholder):', JSON.stringify(expenses, null, 2));
  // In a real scenario, you would use Firebase SDK to save data
  // Example:
  // try {
  //   const db = getFirestore(); // Initialize Firebase
  //   for (const expense of expenses) {
  //     await addDoc(collection(db, "expenses"), expense);
  //   }
  //   return { success: true, message: 'Expenses saved successfully to Firebase.' };
  // } catch (error) {
  //   console.error('Error saving to Firebase:', error);
  //   return { success: false, message: 'Failed to save expenses to Firebase.' };
  // }
  return { success: true, message: 'Expenses processed (simulated save).' };
}
