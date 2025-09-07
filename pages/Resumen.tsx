import React, { useMemo, useState } from 'react';
import { Profile, Filters, TransactionTypeFilter, Transaction } from '../types';
import Summary from '../components/Summary';
import TransactionList from '../components/IncomeList';
import MonthlySummary from '../components/MonthlySummary';
import GlobalSummary from '../components/GlobalSummary';
import MonthlyBreakdownModal from '../components/MonthlyBreakdownModal';
import FilterPanel from '../components/FilterPanel';
import FilterIcon from '../components/icons/FilterIcon';
import TransactionDetailModal from '../components/TransactionDetailModal';

interface ResumenProps {
  profile: Profile;
  balance: number;
  balancesByMethod: Record<string, number>;
  onDeleteTransaction: (id: string) => void;
  onInitiateDeposit: () => void;
  onInitiateWithdrawal: () => void;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyIncomeByBank: number;
  monthlyIncomeByCash: number;
  monthlyExpensesByBank: number;
  monthlyExpensesByCash: number;
  totalIncome: number;
  totalExpenses: number;
}

const CASH_METHOD_ID = 'efectivo';

const Resumen: React.FC<ResumenProps> = ({ 
  profile, balance, balancesByMethod, onDeleteTransaction,
  onInitiateDeposit, onInitiateWithdrawal,
  monthlyIncome, monthlyExpenses,
  monthlyIncomeByBank, monthlyIncomeByCash,
  monthlyExpensesByBank, monthlyExpensesByCash,
  totalIncome, totalExpenses
}) => {
  const { data: { transactions, categories, bankAccounts }, currency } = profile;
  const [modalType, setModalType] = useState<'income' | 'expense' | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filters | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);

  const ahorroCategoryId = useMemo(() => {
    return categories.find(c => c.name.toLowerCase() === 'ahorro')?.id;
  }, [categories]);
  
  const handleApplyFilters = (newFilters: Filters) => {
    const { startDate, endDate, types, methods, bankAccounts, categories } = newFilters;
    const isFilterActive = !!startDate || !!endDate || types.length > 0 || methods.length > 0 || bankAccounts.length > 0 || categories.length > 0;
    setActiveFilters(isFilterActive ? newFilters : null);
    setIsFilterPanelOpen(false);
  };

  const filteredTransactions = useMemo(() => {
    if (!activeFilters) return transactions;

    const { startDate, endDate, types, methods, bankAccounts: filteredBankAccounts, categories: filteredCategories } = activeFilters;
    
    const start = startDate ? new Date(startDate) : null;
    if (start) start.setUTCHours(0,0,0,0);
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setUTCHours(23,59,59,999);

    const hasTypeFilter = types.length > 0;
    const hasMethodFilter = methods.length > 0;
    const hasBankFilter = filteredBankAccounts.length > 0;
    const hasCategoryFilter = filteredCategories.length > 0;

    return transactions.filter(t => {
        const transactionDate = new Date(t.date);

        if (start && transactionDate < start) return false;
        if (end && transactionDate > end) return false;

        if (hasTypeFilter) {
            let transactionTypeForFilter: TransactionTypeFilter;

            if (t.transferId) {
                transactionTypeForFilter = 'transfer';
            } else if (t.type === 'expense' && t.categoryId === ahorroCategoryId) {
                transactionTypeForFilter = 'saving';
            } else if (t.type === 'expense' && t.patrimonioType === 'loan') {
                transactionTypeForFilter = 'loan';
            } else {
                transactionTypeForFilter = t.type;
            }
            
            if (!types.includes(transactionTypeForFilter)) return false;
        }
        
        if (hasMethodFilter || hasBankFilter) {
            const isCash = t.paymentMethodId === CASH_METHOD_ID;
            const methodType = isCash ? 'cash' : 'bank';
            
            if (hasMethodFilter && !methods.includes(methodType)) return false;
            
            if (!isCash && hasBankFilter) {
                if (!filteredBankAccounts.includes(t.paymentMethodId)) return false;
            }
        }
        
        if (hasCategoryFilter) {
            if (!t.categoryId || !filteredCategories.includes(t.categoryId)) {
                return false;
            }
        }

        return true;
    });
}, [transactions, activeFilters, ahorroCategoryId]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Resumen General
      </h1>
      <Summary 
        balance={balance} 
        balancesByMethod={balancesByMethod}
        onCashClick={onInitiateDeposit}
        onBankClick={onInitiateWithdrawal}
        currency={currency}
      />
      
      <div className="mt-8">
        <MonthlySummary 
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          onIncomeClick={() => setModalType('income')}
          onExpenseClick={() => setModalType('expense')}
          currency={currency}
        />
      </div>

      <div className="mt-8">
        <GlobalSummary
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          currency={currency}
        />
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historial de Transacciones</h2>
            <button
                onClick={() => setIsFilterPanelOpen(true)}
                aria-label="Filtrar transacciones"
                className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#008f39]"
            >
                <FilterIcon className="w-6 h-6" />
                {activeFilters && (
                    <span className="absolute top-1 right-1 block w-2 h-2 bg-blue-500 rounded-full ring-2 ring-gray-50 dark:ring-black"></span>
                )}
            </button>
        </div>
        <TransactionList 
          transactions={filteredTransactions} 
          categories={categories}
          bankAccounts={bankAccounts}
          onDeleteTransaction={onDeleteTransaction}
          onItemClick={setDetailTransaction}
          currency={currency}
        />
      </div>
      <MonthlyBreakdownModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType}
        incomeByBank={monthlyIncomeByBank}
        incomeByCash={monthlyIncomeByCash}
        expenseByBank={monthlyExpensesByBank}
        expenseByCash={monthlyExpensesByCash}
        currency={currency}
      />
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={activeFilters}
        bankAccounts={bankAccounts}
        categories={categories}
      />
      <TransactionDetailModal
        isOpen={!!detailTransaction}
        onClose={() => setDetailTransaction(null)}
        transaction={detailTransaction}
        categories={categories}
        bankAccounts={bankAccounts}
        currency={currency}
      />
    </div>
  );
};

export default Resumen;