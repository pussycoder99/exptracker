'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Expense, TaxOptimizationOutput } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface TaxOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  optimizationResult: TaxOptimizationOutput | null;
  isLoading: boolean;
  onUpdateDescription: (expenseId: string, newBanglaDescription: string) => void;
}

export default function TaxOptimizationModal({
  isOpen,
  onClose,
  expense,
  optimizationResult,
  isLoading,
  onUpdateDescription,
}: TaxOptimizationModalProps) {
  const [optimizedBangla, setOptimizedBangla] = useState('');

  useEffect(() => {
    if (optimizationResult) {
      setOptimizedBangla(optimizationResult.optimizedTranslation);
    } else {
      setOptimizedBangla(expense.descriptionBangla); // Default to current if no result yet
    }
  }, [optimizationResult, expense.descriptionBangla]);

  const handleUpdate = () => {
    onUpdateDescription(expense.id, optimizedBangla);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-primary font-headline">Tax Optimization Assistant</DialogTitle>
          <DialogDescription>
            Review and apply optimized Bangla translation for '{expense.descriptionEnglish}'.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4">Fetching optimization suggestions...</p>
          </div>
        )}

        {!isLoading && optimizationResult && (
          <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-4 pr-4">
              <div>
                <Label htmlFor="currentBangla" className="font-semibold">Current Bangla Description:</Label>
                <p id="currentBangla" className="text-sm p-2 bg-muted rounded-md min-h-[60px]">{expense.descriptionBangla}</p>
              </div>
              
              <div>
                <Label htmlFor="optimizedBangla" className="font-semibold text-primary">Optimized Bangla Translation:</Label>
                <Textarea
                  id="optimizedBangla"
                  value={optimizedBangla}
                  onChange={(e) => setOptimizedBangla(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="font-semibold">Reasoning for Optimization:</Label>
                <p className="text-sm p-2 bg-muted rounded-md">{optimizationResult.reasoning}</p>
              </div>
            </div>
          </ScrollArea>
        )}
        
        {!isLoading && !optimizationResult && !expense.descriptionBangla && (
           <p className="text-muted-foreground py-4">No Bangla description provided to optimize.</p>
        )}

        {!isLoading && !optimizationResult && expense.descriptionBangla && !isLoading && (
            <p className="text-destructive py-4">Could not fetch optimization suggestions. Please try again.</p>
        )}


        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleUpdate} 
            disabled={isLoading || !optimizationResult || optimizedBangla === expense.descriptionBangla}
          >
            Update Description
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
