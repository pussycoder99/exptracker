'use client';

import type { Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit3 } from 'lucide-react'; // Using Edit3 for "Optimize Tax Text" icon

interface ExpenseListProps {
  expenses: Expense[];
  onOptimizeTax: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, onOptimizeTax }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No expenses added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
       <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">Expense Records</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] md:h-[600px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Expense For</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {expense.expenseFor}
                    {(expense.employeeName || expense.domainPanelName) && (
                       <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                         {expense.employeeName || expense.domainPanelName}
                       </Badge>
                    )}
                  </TableCell>
                  <TableCell>{expense.amount.toFixed(2)} {expense.currency}</TableCell>
                  <TableCell>{expense.paidBy}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onOptimizeTax(expense)} title="Optimize Tax Text">
                      <Edit3 className="h-4 w-4 text-primary" />
                      <span className="sr-only">Optimize Tax Text</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
