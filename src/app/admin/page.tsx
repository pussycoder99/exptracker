
'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Expense } from '@/lib/types';
import { fetchExpensesFromFirebase } from '@/lib/actions';
import { generateExpenseReportPDF, downloadPdf } from '@/lib/pdfGenerator';
import { Loader2, Search, FileDown, ShieldAlert, KeyRound, DollarSign, BarChartHorizontalBig } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const ADMIN_PASSWORD = "Aman123@@@"; // Hardcoded password - NOT FOR PRODUCTION

// Chart configuration
const defaultChartConfig = {
  totalAmount: {
    label: "Amount (Mixed Currencies)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


export default function AdminPage() {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return; 

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
  }, [toast, isAuthenticated]);

  const summaryStats = useMemo(() => {
    const totalsByCurrency: { [key: string]: number } = {};
    const amountsByCategory: { [key: string]: number } = {};

    for (const expense of allExpenses) {
      totalsByCurrency[expense.currency] = (totalsByCurrency[expense.currency] || 0) + expense.amount;
      amountsByCategory[expense.expenseFor] = (amountsByCategory[expense.expenseFor] || 0) + expense.amount;
    }
    
    const categoryChartData = Object.entries(amountsByCategory)
        .map(([name, total]) => ({
            name,
            totalAmount: total, // Matches chartConfig key
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

    return { totalsByCurrency, categoryChartData };
  }, [allExpenses]);


  const filteredExpenses = useMemo(() => {
    if (!searchTerm.trim()) return allExpenses;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allExpenses.filter(expense =>
      Object.entries(expense).some(([key, value]) => {
        if (value === null || typeof value === 'undefined') return false;
        if (key === 'location' || key === 'id') return false; 

        let stringValue = '';
        if (typeof value === 'string') {
          stringValue = value.toLowerCase();
        } else if (typeof value === 'number') {
          stringValue = value.toString().toLowerCase();
        } else if (value instanceof Date) {
          stringValue = value.toLocaleDateString().toLowerCase();
        } else {
          return false; 
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
      const pdfBytes = await generateExpenseReportPDF(filteredExpenses, null); 
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

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput(''); 
      toast({ title: "Access Granted", description: "Welcome to the Admin Dashboard." });
    } else {
      setAuthError("Incorrect password. Please try again.");
      setPasswordInput(''); 
      toast({ title: "Access Denied", description: "Incorrect password.", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <KeyRound className="mr-2 h-6 w-6" /> Admin Access Required
              </CardTitle>
              <CardDescription>
                Please enter the password to access the admin dashboard.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter admin password"
                    className="text-base py-2.5"
                  />
                </div>
                {authError && <p className="text-sm text-destructive flex items-center"><ShieldAlert className="h-4 w-4 mr-1"/>{authError}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Unlock Dashboard
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-headline font-bold mb-6 text-primary">Admin Dashboard</h1>

        {isLoading && (
            <div className="flex flex-col justify-center items-center py-20 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
            <p className="text-lg text-muted-foreground">Loading dashboard data...</p>
            </div>
        )}

        {!isLoading && error && (
            <div className="py-20 text-center">
            <p className="text-xl text-destructive mb-2">Failed to Load Data</p>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Try Again</Button>
            </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(summaryStats.totalsByCurrency).map(([currency, total]) => (
                <Card key={currency} className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses ({currency})</CardTitle>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total amount spent in {currency}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {allExpenses.length > 0 && Object.keys(summaryStats.totalsByCurrency).length === 0 && (
                 <Card className="shadow-lg md:col-span-2 lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">N/A</div>
                        <p className="text-xs text-muted-foreground">No expenses with valid amounts found.</p>
                    </CardContent>
                 </Card>
              )}
            </div>

            {/* Expenses by Category Chart */}
            {summaryStats.categoryChartData.length > 0 && (
              <Card className="shadow-xl rounded-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-xl font-headline text-primary flex items-center">
                    <BarChartHorizontalBig className="mr-2 h-6 w-6" />
                    Expenses by Category
                  </CardTitle>
                  <CardDescription>Visual representation of expenses per category (mixed currencies).</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartContainer config={defaultChartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={summaryStats.categoryChartData} accessibilityLayer margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          tickLine={false} 
                          axisLine={false} 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          interval={0}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => `${value.toLocaleString()}`}
                        />
                        <RechartsTooltip
                          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                          content={<ChartTooltipContent indicator="dot" hideLabel />}
                        />
                        <Bar dataKey="totalAmount" fill="var(--color-totalAmount)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Expenses Table Card */}
            <Card className="shadow-xl rounded-lg">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-primary">Expense Overview & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by any field..."
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

                {allExpenses.length === 0 && !isLoading && (
                     <p className="text-center text-muted-foreground py-20 text-lg">No expenses have been recorded yet.</p>
                )}
                {allExpenses.length > 0 && filteredExpenses.length === 0 && searchTerm && (
                  <p className="text-center text-muted-foreground py-20 text-lg">No expenses match your search term &quot;{searchTerm}&quot;.</p>
                )}

                {filteredExpenses.length > 0 && (
                  <ScrollArea className="h-[calc(100vh-450px)] md:h-[calc(100vh-420px)] w-full border rounded-lg shadow-inner">
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
          </>
        )}
      </div>
    </AppLayout>
  );
}
