
'use server';

import { taxOptimizationAssistant } from '@/ai/flows/tax-optimization-assistant';
import type { TaxOptimizationAssistantInput, TaxOptimizationAssistantOutput } from '@/ai/flows/tax-optimization-assistant';
import type { Expense } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, getDocs, query, orderBy } from 'firebase/firestore';

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
      const expenseData = {
        ...expense,
        date: Timestamp.fromDate(new Date(expense.date)),
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

export async function fetchExpensesFromFirebase(): Promise<Expense[]> {
  const expensesCollectionRef = collection(db, 'expenses');
  const q = query(expensesCollectionRef, orderBy('date', 'desc')); // Order by date, newest first
  const querySnapshot = await getDocs(q);
  
  const expenses: Expense[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Ensure that all fields of Expense are present, or provide defaults/handle missing data
    expenses.push({
      id: doc.id,
      expenseFor: data.expenseFor || 'N/A',
      employeeName: data.employeeName,
      domainPanelName: data.domainPanelName,
      otherExpenseDetails: data.otherExpenseDetails || 'No details',
      amount: data.amount || 0,
      currency: data.currency || 'N/A',
      descriptionEnglish: data.descriptionEnglish || 'N/A',
      descriptionBangla: data.descriptionBangla || 'N/A',
      date: (data.date as Timestamp).toDate(), // Convert Firestore Timestamp to JS Date
      paidBy: data.paidBy || 'N/A',
      approvedBy: data.approvedBy || 'N/A',
      location: data.location // This could be undefined if not set
    } as Expense); // It's good practice to ensure the object conforms to the Expense type
  });
  return expenses;
}
