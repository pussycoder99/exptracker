
'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Expense } from '@/lib/types';
import { fetchExpensesFromFirebase } from '@/lib/actions';
import { generateExpenseReportPDF, downloadPdf } from '@/lib/pdfGenerator';
import { Loader2, Search, FileDown } from 'lucide-react';

export default function AdminPage() {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadExpenses() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedExpenses = await fetchExpensesFromFirebase();
        setAllExpenses(fetchedExpenses);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching expenses.";
        setError(errorMessage);
        toast({ title: "Error Loading Expenses", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadExpenses();
  }, [toast]);

  const filteredExpenses = useMemo(() => {
    if (!searchTerm.trim()) return allExpenses;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allExpenses.filter(expense =>
      Object.entries(expense).some(([key, value]) => {
        if (value === null || typeof value === 'undefined') return false;
        if (key === 'location' || key === 'id') return false; // Don't search by location object or id

        let stringValue = '';
        if (typeof value === 'string') {
          stringValue = value.toLowerCase();
        } else if (typeof value === 'number') {
          stringValue = value.toString().toLowerCase();
        } else if (value instanceof Date) {
          stringValue = value.toLocaleDateString().toLowerCase();
        } else {
          return false; // Skip other types for now
        }
        return stringValue.includes(lowerSearchTerm);
      })
    );
  }, [allExpenses, searchTerm]);

  const handleDownloadPdf = async () => {
    if (filteredExpenses.length === 0) {
      toast({ title: "No Data", description: "No expenses to include in the PDF.", variant: "destructive" });
      return;
    }
    setIsDownloadingPdf(true);
    toast({ title: "Generating PDF...", description: "Please wait." });
    try {
      const pdfBytes = await generateExpenseReportPDF(filteredExpenses, null); // Pass null for geolocation
      downloadPdf(pdfBytes, `Admin_Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: "PDF Generated", description: "Admin expense report PDF has been downloaded." });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not generate PDF.";
      toast({ title: "PDF Generation Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Admin Dashboard - Expense Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by any field (e.g., VPS, John Doe, 100)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full text-base py-2.5 rounded-md shadow-sm"
                />
              </div>
              <Button 
                onClick={handleDownloadPdf} 
                disabled={isDownloadingPdf || filteredExpenses.length === 0}
                className="w-full sm:w-auto rounded-md shadow-sm"
              >
                {isDownloadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Download PDF ({filteredExpenses.length})
              </Button>
            </div>

            {isLoading && (
              <div className="flex flex-col justify-center items-center py-20 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
                <p className="text-lg text-muted-foreground">Loading expenses, please wait...</p>
              </div>
            )}
            {!isLoading && error && (
              <div className="py-20 text-center">
                <p className="text-xl text-destructive mb-2">Failed to Load Expenses</p>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Try Again</Button>
              </div>
            )}
            {!isLoading && !error && allExpenses.length === 0 && (
                 <p className="text-center text-muted-foreground py-20 text-lg">No expenses have been recorded yet.</p>
            )}
            {!isLoading && !error && allExpenses.length > 0 && filteredExpenses.length === 0 && searchTerm && (
              <p className="text-center text-muted-foreground py-20 text-lg">No expenses match your search term &quot;{searchTerm}&quot;.</p>
            )}

            {!isLoading && !error && filteredExpenses.length > 0 && (
              <ScrollArea className="h-[calc(100vh-350px)] md:h-[calc(100vh-320px)] w-full border rounded-lg shadow-inner">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[180px]">Expense For</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right w-[100px]">Amount</TableHead>
                      <TableHead className="w-[80px]">Currency</TableHead>
                      <TableHead className="w-[150px]">Paid By</TableHead>
                      <TableHead className="w-[150px]">Approved By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {expense.expenseFor}
                          {expense.employeeName && <span className="block text-xs text-muted-foreground mt-0.5">Emp: {expense.employeeName}</span>}
                          {expense.domainPanelName && <span className="block text-xs text-muted-foreground mt-0.5">Panel: {expense.domainPanelName}</span>}
                        </TableCell>
                        <TableCell className="max-w-sm truncate text-sm" title={expense.otherExpenseDetails}>{expense.otherExpenseDetails}</TableCell>
                        <TableCell className="text-right font-semibold">{expense.amount.toFixed(2)}</TableCell>
                        <TableCell>{expense.currency}</TableCell>
                        <TableCell>{expense.paidBy}</TableCell>
                        <TableCell>{expense.approvedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
