
'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import TaxOptimizationModal from '@/components/TaxOptimizationModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/use-geolocation';
import type { Expense, GeolocationData, TaxOptimizationOutput } from '@/lib/types';
import { runTaxOptimization, saveExpensesToFirebase } from '@/lib/actions';
import { generateExpenseReportPDF, downloadPdf } from '@/lib/pdfGenerator';
import { FileText, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpenseForTaxOpt, setSelectedExpenseForTaxOpt] = useState<Expense | null>(null);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxOptResult, setTaxOptResult] = useState<TaxOptimizationOutput | null>(null);
  const [isLoadingTaxOpt, setIsLoadingTaxOpt] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isGeneratingPdfAndSending, setIsGeneratingPdfAndSending] = useState(false); // Combined state

  const { location, error: geoError, getLocation, isLoading: isLoadingGeo } = useGeolocation();
  const { toast } = useToast();

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (geoError) {
      toast({
        title: 'Geolocation Error',
        description: geoError,
        variant: 'destructive',
      });
    }
  }, [geoError, toast]);

  const handleAddExpense = useCallback((newExpenseData: Omit<Expense, 'id' | 'location'>) => {
    setIsSubmittingForm(true);
    const newExpense: Expense = {
      ...newExpenseData,
      id: Date.now().toString(), // Simple ID generation
      location: location || undefined,
    };
    setExpenses(prev => [newExpense, ...prev]); // Add to beginning of list
    toast({
      title: 'Expense Added Locally',
      description: `${newExpenseData.expenseFor} for ${newExpenseData.amount} ${newExpenseData.currency} added. Remember to 'Generate PDF & Send' to save to database.`,
    });
    setIsSubmittingForm(false);
  }, [location, toast]);

  const handleOpenTaxOptimization = useCallback(async (expense: Expense) => {
    setSelectedExpenseForTaxOpt(expense);
    setIsLoadingTaxOpt(true);
    setIsTaxModalOpen(true);
    setTaxOptResult(null);

    const expenseDetails = `Type: ${expense.expenseFor}, Amount: ${expense.amount} ${expense.currency}, Details: ${expense.otherExpenseDetails}, English Desc: ${expense.descriptionEnglish}`;
    
    let expenseLocationString = 'User location not available';
    if (expense.location) {
      expenseLocationString = `Latitude: ${expense.location.latitude}, Longitude: ${expense.location.longitude}`;
    } else if (location) { // Fallback to current fetched location if expense specific one is not there
       expenseLocationString = `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
    }


    try {
      const result = await runTaxOptimization({
        expenseDetails,
        currentTranslation: expense.descriptionBangla,
        expenseLocation: expenseLocationString,
      });
      setTaxOptResult(result);
    } catch (error) {
      console.error("Error fetching tax optimization:", error);
      toast({
        title: 'Tax Optimization Failed',
        description: error instanceof Error ? error.message : 'Could not fetch suggestions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTaxOpt(false);
    }
  }, [location, toast]);

  const handleUpdateBanglaDescription = useCallback((expenseId: string, newBanglaDescription: string) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(exp =>
        exp.id === expenseId ? { ...exp, descriptionBangla: newBanglaDescription } : exp
      )
    );
    setIsTaxModalOpen(false);
    toast({
      title: 'Description Updated',
      description: 'Bangla description has been updated locally.',
    });
  }, [toast]);

  const handleGeneratePdfAndSend = async () => {
    if (expenses.length === 0) {
      toast({
        title: 'No Expenses',
        description: 'Please add some expenses before generating a report.',
        variant: 'destructive'
      });
      return;
    }
    setIsGeneratingPdfAndSending(true);
    toast({ title: 'Processing...', description: 'Generating PDF and sending data to Firebase.' });
    
    let pdfGenerated = false;
    try {
      const pdfBytes = await generateExpenseReportPDF(expenses, location);
      downloadPdf(pdfBytes, `SNBD_Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: 'PDF Generated', description: 'Your expense report PDF has been downloaded.' });
      pdfGenerated = true;

      const sendResult = await saveExpensesToFirebase(expenses);
      if (sendResult.success) {
        toast({ title: 'Data Saved to Firebase', description: sendResult.message });
        // Optionally clear expenses after successful save
        // setExpenses([]); 
      } else {
        toast({ title: 'Firebase Save Failed', description: sendResult.message, variant: 'destructive' });
      }

    } catch (error) {
      console.error("Error during PDF generation or Firebase send:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      if (pdfGenerated) {
        toast({
          title: 'Firebase Send Failed',
          description: `PDF was generated, but sending data failed: ${message}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Operation Failed',
          description: `Could not generate PDF or send data: ${message}`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsGeneratingPdfAndSending(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-headline font-bold mb-8 text-center text-primary">SNBD Expense Tracker</h1>
        
        {isLoadingGeo && <p className="text-center text-muted-foreground mb-4">Fetching location...</p>}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <ExpenseForm onSubmit={handleAddExpense} isSubmitting={isSubmittingForm} />
          </div>
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-background py-2 z-10">
              {expenses.length > 0 && (
                <Button onClick={handleGeneratePdfAndSend} disabled={isGeneratingPdfAndSending} className="ml-auto">
                  {isGeneratingPdfAndSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Generate PDF & Save
                </Button>
              )}
            </div>
            <ExpenseList expenses={expenses} onOptimizeTax={handleOpenTaxOptimization} />
          </div>
        </div>
      </div>
      {selectedExpenseForTaxOpt && (
        <TaxOptimizationModal
          isOpen={isTaxModalOpen}
          onClose={() => setIsTaxModalOpen(false)}
          expense={selectedExpenseForTaxOpt}
          optimizationResult={taxOptResult}
          isLoading={isLoadingTaxOpt}
          onUpdateDescription={handleUpdateBanglaDescription}
        />
      )}
    </AppLayout>
  );
}

