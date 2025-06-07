
'use server';

import { taxOptimizationAssistant } from '@/ai/flows/tax-optimization-assistant';
import type { TaxOptimizationAssistantInput, TaxOptimizationAssistantOutput } from '@/ai/flows/tax-optimization-assistant';
import type { Expense } from '@/lib/types';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { collection, addDoc, Timestamp } from 'firebase/firestore';
// import { format } from 'date-fns'; // No longer needed for Google Sheets

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

export async function saveExpensesToFirebase(expenses: Expense[]): Promise<{ success: boolean; message: string; count?: number }> {
  if (!expenses || expenses.length === 0) {
    return { success: true, message: 'No expenses to save.', count: 0 };
  }

  try {
    const expensesCollectionRef = collection(db, 'expenses');
    let successfulSaves = 0;

    for (const expense of expenses) {
      // Convert Date object to Firestore Timestamp
      const expenseData = {
        ...expense,
        date: Timestamp.fromDate(new Date(expense.date)), // Ensure date is a Firestore Timestamp
        // Ensure location is serializable or handle it appropriately
        location: expense.location ? { 
            latitude: expense.location.latitude, 
            longitude: expense.location.longitude 
        } : null,
      };
      await addDoc(expensesCollectionRef, expenseData);
      successfulSaves++;
    }
    
    return { 
        success: true, 
        message: `Successfully saved ${successfulSaves} expense(s) to Firebase.`,
        count: successfulSaves 
    };
  } catch (error) {
    console.error('Error saving expenses to Firebase:', error);
    let errorMessage = 'Failed to save expenses to Firebase.';
    if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}`;
    }
    return { success: false, message: errorMessage };
  }
}
