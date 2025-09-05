import { Transaction, BankAccount } from './types';

const CASH_METHOD_ID = 'efectivo';

/**
 * Validates a proposed set of transactions against business rules.
 * @param updatedTransactions The complete list of transactions after the proposed change.
 * @param bankAccounts The list of bank accounts.
 * @returns An error message string if validation fails, otherwise null.
 */
export const validateTransactionChange = (updatedTransactions: Transaction[], bankAccounts: BankAccount[]): string | null => {
  if (updatedTransactions.length === 0) {
    return null;
  }

  // Rule: Chronological balances cannot be negative.
  const sorted = [...updatedTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    // If dates are same, process incomes before expenses to avoid false negatives
    if (a.type === 'income' && b.type === 'expense') return -1;
    if (a.type === 'expense' && b.type === 'income') return 1;
    return 0;
  });

  const initialBalances: Record<string, number> = {
    [CASH_METHOD_ID]: 0,
  };
  bankAccounts.forEach(acc => {
    initialBalances[acc.id] = 0;
  });

  let currentBalances = { ...initialBalances };

  for (const t of sorted) {
    const amount = t.type === 'income' ? t.amount : -t.amount;
    const newBalanceForMethod = (currentBalances[t.paymentMethodId] || 0) + amount;
    
    // Use a small epsilon for floating point comparisons
    if (newBalanceForMethod < -0.001) {
        const methodDate = new Date(t.date).toLocaleDateString('es-ES');
        const methodName = t.paymentMethodId === CASH_METHOD_ID 
            ? 'Efectivo' 
            : bankAccounts.find(b => b.id === t.paymentMethodId)?.name || 'una cuenta';
        return `La operación resulta en un saldo negativo para ${methodName} el ${methodDate}. Operación bloqueada.`;
    }
    
    currentBalances[t.paymentMethodId] = newBalanceForMethod;
  }

  return null; // All checks passed
};


/**
 * Finds the date of the first income transaction.
 * @param transactions - A list of all transactions.
 * @returns The Date of the first income, or null if no income exists.
 */
export const findFirstIncomeDate = (transactions: Transaction[]): Date | null => {
  const incomes = transactions.filter(t => t.type === 'income');
  if (incomes.length === 0) {
    return null;
  }
  const sortedIncomes = [...incomes].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  // Set to start of the day for comparison
  const date = new Date(sortedIncomes[0].date);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

/**
 * Finds the first date on which a given account had a balance sufficient to cover a specific amount.
 * @param transactions The complete list of all transactions.
 * @param accountId The ID of the account to check (e.g., 'efectivo' or a bank account ID).
 * @param requiredAmount The amount of funds required.
 * @returns The date string (YYYY-MM-DD) of the first day the balance was sufficient, or null if it never was.
 */
export const findFirstDateWithSufficientBalance = (transactions: Transaction[], accountId: string, requiredAmount: number): string | null => {
  if (requiredAmount <= 0) {
    return null; // No minimum date required for zero or negative amount
  }

  const sorted = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    // Prioritize income on the same day to allow spending it immediately
    if (a.type === 'income' && b.type === 'expense') return -1;
    if (a.type === 'expense' && b.type === 'income') return 1;
    return 0;
  });

  let balance = 0;

  for (const t of sorted) {
    if (t.paymentMethodId === accountId) {
      const amount = t.type === 'income' ? t.amount : -t.amount;
      balance += amount;
    }

    if (balance >= requiredAmount) {
      return t.date; // This is the first moment balance is sufficient
    }
  }

  return null; // Balance was never sufficient
};
