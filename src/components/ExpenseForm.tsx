'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Expense, ExpenseForType, CurrencyType, ApprovedByType } from '@/lib/types';
import { ExpenseForOptions, CurrencyOptions, ApprovedByOptions } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const expenseFormSchema = z.object({
  expenseFor: z.enum(ExpenseForOptions, { required_error: "Expense type is required." }),
  employeeName: z.string().optional(),
  domainPanelName: z.string().optional(),
  otherExpenseDetails: z.string().min(1, "Other expense details are required."),
  amount: z.coerce.number({invalid_type_error: "Amount must be a number."}).positive("Amount must be positive."),
  currency: z.enum(CurrencyOptions, { required_error: "Currency is required." }),
  descriptionEnglish: z.string().min(1, "English description is required."),
  descriptionBangla: z.string().min(1, "Bangla description is required."),
  date: z.date({ required_error: "Date is required." }),
  paidBy: z.string().min(1, "Paid by is required."),
  approvedBy: z.enum(ApprovedByOptions, { required_error: "Approver is required." }),
}).superRefine((data, ctx) => {
  if (data.expenseFor === 'Employee Expenses' && (!data.employeeName || data.employeeName.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Employee Name is required.',
      path: ['employeeName'],
    });
  }
  if (data.expenseFor === 'Domain Panel Fund' && (!data.domainPanelName || data.domainPanelName.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Domain Panel Name is required.',
      path: ['domainPanelName'],
    });
  }
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, 'id' | 'location'>) => void;
  isSubmitting?: boolean;
}

export default function ExpenseForm({ onSubmit, isSubmitting }: ExpenseFormProps) {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      currency: 'USD',
      approvedBy: 'YEAMIN ADIB',
      date: new Date(),
    },
  });

  const expenseForValue = form.watch('expenseFor');

  const handleFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">Add New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="expenseFor">Expense For</Label>
            <Controller
              name="expenseFor"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="expenseFor">
                    <SelectValue placeholder="Select expense type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ExpenseForOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.expenseFor && <p className="text-sm text-destructive mt-1">{form.formState.errors.expenseFor.message}</p>}
          </div>

          {expenseForValue === 'Employee Expenses' && (
            <div>
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input id="employeeName" {...form.register('employeeName')} />
              {form.formState.errors.employeeName && <p className="text-sm text-destructive mt-1">{form.formState.errors.employeeName.message}</p>}
            </div>
          )}

          {expenseForValue === 'Domain Panel Fund' && (
            <div>
              <Label htmlFor="domainPanelName">Domain Panel Name</Label>
              <Input id="domainPanelName" {...form.register('domainPanelName')} />
              {form.formState.errors.domainPanelName && <p className="text-sm text-destructive mt-1">{form.formState.errors.domainPanelName.message}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="otherExpenseDetails">Other Expense Details</Label>
            <Textarea id="otherExpenseDetails" {...form.register('otherExpenseDetails')} />
            {form.formState.errors.otherExpenseDetails && <p className="text-sm text-destructive mt-1">{form.formState.errors.otherExpenseDetails.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" {...form.register('amount')} />
              {form.formState.errors.amount && <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>}
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Controller
                name="currency"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CurrencyOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.currency && <p className="text-sm text-destructive mt-1">{form.formState.errors.currency.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="descriptionEnglish">Description (English)</Label>
            <Textarea id="descriptionEnglish" {...form.register('descriptionEnglish')} />
            {form.formState.errors.descriptionEnglish && <p className="text-sm text-destructive mt-1">{form.formState.errors.descriptionEnglish.message}</p>}
          </div>

          <div>
            <Label htmlFor="descriptionBangla">Description (Bangla)</Label>
            <Textarea id="descriptionBangla" {...form.register('descriptionBangla')} />
            {form.formState.errors.descriptionBangla && <p className="text-sm text-destructive mt-1">{form.formState.errors.descriptionBangla.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Controller
                name="date"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.date && <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>}
            </div>

            <div>
              <Label htmlFor="paidBy">Paid By</Label>
              <Input id="paidBy" {...form.register('paidBy')} />
              {form.formState.errors.paidBy && <p className="text-sm text-destructive mt-1">{form.formState.errors.paidBy.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="approvedBy">Approved By</Label>
            <Controller
              name="approvedBy"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="approvedBy">
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {ApprovedByOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.approvedBy && <p className="text-sm text-destructive mt-1">{form.formState.errors.approvedBy.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
