import type { TaxOptimizationAssistantOutput as GenAITaxOutput } from '@/ai/flows/tax-optimization-assistant';

export interface Expense {
  id: string;
  expenseFor: 'VPS' | 'License' | 'Employee Expenses' | 'Domain Panel Fund' | string;
  employeeName?: string;
  domainPanelName?: string;
  otherExpenseDetails: string;
  amount: number;
  currency: 'USD' | 'BDT' | 'EURO' | string;
  descriptionEnglish: string;
  descriptionBangla: string;
  date: Date;
  paidBy: string;
  approvedBy: 'YEAMIN ADIB' | 'RAIYAN BASHAR' | string;
  location?: GeolocationData;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  city?: string; // Optional: if reverse geocoding is implemented
  country?: string; // Optional: if reverse geocoding is implemented
}

export type TaxOptimizationOutput = GenAITaxOutput;

export const ExpenseForOptions = ['VPS', 'License', 'Employee Expenses', 'Domain Panel Fund'] as const;
export type ExpenseForType = typeof ExpenseForOptions[number];

export const CurrencyOptions = ['USD', 'BDT', 'EURO'] as const;
export type CurrencyType = typeof CurrencyOptions[number];

export const ApprovedByOptions = ['YEAMIN ADIB', 'RAIYAN BASHAR'] as const;
export type ApprovedByType = typeof ApprovedByOptions[number];
