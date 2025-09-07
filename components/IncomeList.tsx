import React, { useMemo } from 'react';
import { Transaction, Category, BankAccount } from '../types';
import TransactionItem from './IncomeItem';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  bankAccounts: BankAccount[];
  onDeleteTransaction: (id: string) => void;
  onItemClick: (transaction: Transaction) => void;
  currency: string;
}

const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00Z');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  if (date.getTime() === today.getTime()) return 'Hoy';
  if (date.getTime() === yesterday.getTime()) return 'Ayer';
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  };
  const formatted = new Intl.DateTimeFormat('es-ES', options).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};


const TransactionList: React.FC<TransactionListProps> = ({
  transactions, categories, bankAccounts,
  onDeleteTransaction, onItemClick,
  currency 
}) => {
  const groupedTransactions = useMemo(() => {
    // The `transactions` array from props is already sorted with newest items first.
    // We just need to group them by date, preserving that order.
    return transactions.reduce((acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [transactions]);
  
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <p className="text-gray-500 dark:text-gray-400">No hay transacciones que coincidan con tus filtros.</p>
        <p className="text-gray-500 dark:text-gray-400">¡Intenta ajustar la búsqueda o añade una nueva transacción!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date} className="animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 sticky top-0 bg-gray-50 dark:bg-black py-1">
            {formatDateHeader(date)}
          </h3>
          <div className="space-y-3">
            {groupedTransactions[date].map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
                category={transaction.categoryId ? categories.find(c => c.id === transaction.categoryId) : undefined}
                bankAccounts={bankAccounts}
                onDelete={onDeleteTransaction}
                onItemClick={onItemClick}
                currency={currency}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;