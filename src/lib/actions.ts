'use server';

import { taxOptimizationAssistant } from '@/ai/flows/tax-optimization-assistant';
import type { TaxOptimizationAssistantInput, TaxOptimizationAssistantOutput } from '@/ai/flows/tax-optimization-assistant';
import type { Expense } from '@/lib/types';
import { google } from 'googleapis';
import { format } from 'date-fns';

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
  console.log('Simulating saving expenses to Firebase:', JSON.stringify(expenses.length, null, 2), 'expenses');
  // In a real scenario, you would use Firebase SDK to save data
  return { success: true, message: 'Expenses processed (simulated Firebase save).' };
}

export async function sendToGoogleSheet(expenses: Expense[]): Promise<{ success: boolean; message: string }> {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!sheetId || !clientEmail || !privateKey) {
      console.error('Google Sheets API credentials are not fully configured in .env');
      return { success: false, message: 'Google Sheets API credentials not configured.' };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const sheetName = 'Expenses'; // Or make this configurable

    // Prepare data for Google Sheets
    // Header row (optional, you might want to set this up in the sheet manually once)
    // const headerRow = ['ID', 'Date', 'Expense For', 'Employee Name', 'Domain Panel Name', 'Amount', 'Currency', 'Paid By', 'Approved By', 'Description (English)', 'Description (Bangla)', 'Other Details', 'Location Lat', 'Location Lon'];
    
    const rowsToAppend = expenses.map(expense => [
      expense.id,
      format(expense.date, 'yyyy-MM-dd'),
      expense.expenseFor,
      expense.employeeName || '',
      expense.domainPanelName || '',
      expense.amount,
      expense.currency,
      expense.paidBy,
      expense.approvedBy,
      expense.descriptionEnglish,
      expense.descriptionBangla,
      expense.otherExpenseDetails,
      expense.location?.latitude || '',
      expense.location?.longitude || '',
    ]);

    // Check if sheet exists, create if not (simplified: assumes sheet exists or first row creates it)
    // A more robust solution would check for the sheet and create it if necessary using sheets.spreadsheets.batchUpdate

    // Check if header exists - for simplicity, this example assumes the header is either manually set
    // or you are okay with appending data and potentially duplicating headers if this runs multiple times
    // without clearing the sheet. A common pattern is to clear a range and then write, or to ensure
    // a header row exists.

    // For this example, we'll just append.
    // Ensure the sheet `Expenses` exists and has a header row if you want one.
    // e.g., A1: 'ID', B1: 'Date', etc.

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:A`, // Append to the first column, Sheets will extend the table
      valueInputOption: 'USER_ENTERED', // Interprets data like numbers, dates correctly
      requestBody: {
        values: rowsToAppend,
      },
    });

    return { success: true, message: 'Expenses successfully sent to Google Sheet.' };
  } catch (error)
