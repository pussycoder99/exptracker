
'use server';

import { taxOptimizationAssistant } from '@/ai/flows/tax-optimization-assistant';
import type { TaxOptimizationAssistantInput, TaxOptimizationAssistantOutput } from '@/ai/flows/tax-optimization-assistant';
import type { Expense } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';

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
  // Critical check for environment variable configuration on the server (Netlify)
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('CRITICAL_SAVE_ERROR: The environment variable NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in the Netlify server environment. This is required for Firebase initialization during save operations.');
    return { 
      success: false, 
      message: 'Critical Server Configuration Error: The environment variable NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing in the Netlify server environment. Cannot save expenses. Please verify this variable in your Netlify site settings and re-deploy.' 
    };
  }
  
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
    console.error('Detailed error saving expenses to Firebase:', error);
    // Attempt to get more specific error information
    let specificMessage = "An unknown error occurred during the save operation.";
    if (error instanceof Error) {
        specificMessage = error.message;
    }
    console.error('Stringified error details during save:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return { 
        success: false, 
        message: `Failed to save expenses to Firebase. Server error: ${specificMessage}. Check server logs on Netlify for more details.` 
    };
  }
}

export async function fetchExpensesFromFirebase(): Promise<Expense[]> {
  const expensesCollectionRef = collection(db, 'expenses');
  const q = query(expensesCollectionRef, orderBy('date', 'desc')); 
  const querySnapshot = await getDocs(q);
  
  const expenses: Expense[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    let expenseDate: Date;

    if (data.date && typeof data.date.toDate === 'function') {
      expenseDate = (data.date as Timestamp).toDate();
    } else {
      console.warn(`Document ${doc.id} has an invalid or missing 'date' field. Value: ${data.date}. Using current date as fallback.`);
      expenseDate = new Date(); 
    }

    const amount = typeof data.amount === 'number' ? data.amount : 0;
    if (typeof data.amount !== 'number') {
      console.warn(`Document ${doc.id} has an invalid or missing 'amount' field. Value: ${data.amount}. Using 0 as fallback.`);
    }

    expenses.push({
      id: doc.id,
      expenseFor: data.expenseFor || 'N/A',
      employeeName: data.employeeName,
      domainPanelName: data.domainPanelName,
      otherExpenseDetails: data.otherExpenseDetails || 'No details',
      amount: amount,
      currency: data.currency || 'N/A',
      descriptionEnglish: data.descriptionEnglish || 'N/A',
      descriptionBangla: data.descriptionBangla || 'N/A',
      date: expenseDate,
      paidBy: data.paidBy || 'N/A',
      approvedBy: data.approvedBy || 'N/A',
      location: data.location 
    });
  });
  return expenses;
}

export async function checkFirebaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("SERVER_CONFIG_ERROR: The environment variable NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in the Netlify server environment. This is required for Firebase initialization.");
    return { 
        connected: false, 
        message: 'Critical Server Configuration Error: The environment variable NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing in the Netlify server environment. Please verify this variable in your Netlify site settings and re-deploy.' 
    };
  }
  try {
    // Using a non-reserved collection name for the test
    const testCollectionRef = collection(db, '_firebase_connection_test_docs_'); 
    await getDocs(query(testCollectionRef, limit(1)));
    return { connected: true, message: 'Successfully connected to Firestore.' };
  } catch (error: any) {
    console.error('Firebase connection check failed with error:', error);
    let userMessage = 'An error occurred while checking the connection.';
    if (error.message) {
        // Firestore often includes useful details in the message
        userMessage = error.message;
    }
    if (error.code === 'permission-denied') {
        userMessage = "Permission denied. Check Firestore security rules."
    } else if (error.code === 'unauthenticated') {
        userMessage = "Authentication is required and has failed or has not yet been provided."
    }
    // The error "Collection id '__fb_connection_test__' is invalid because it is reserved."
    // will be caught here and its message will be passed to the user.
    
    return { connected: false, message: userMessage };
  }
}

