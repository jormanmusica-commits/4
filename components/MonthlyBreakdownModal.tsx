import React from 'react';
import CloseIcon from './icons/CloseIcon';

interface MonthlyBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense' | null;
  incomeByBank: number;
  incomeByCash: number;
  expenseByBank: number;
  expenseByCash: number;
  currency: string;
}

const MonthlyBreakdownModal: React.FC<MonthlyBreakdownModalProps> = ({
  isOpen, onClose, type, incomeByBank, incomeByCash, expenseByBank, expenseByCash, currency
}) => {
  if (!isOpen || !type) return null;
  
  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
  };

  const isIncome = type === 'income';
  const title = isIncome ? 'Desglose de Ingresos Mensuales' : 'Desglose de Gastos Mensuales';
  const totalAmount = isIncome ? incomeByBank + incomeByCash : expenseByBank + expenseByCash;
  const bankAmount = isIncome ? incomeByBank : expenseByBank;
  const cashAmount = isIncome ? incomeByCash : expenseByCash;
  
  // Overall color for the total and border
  const totalColorClass = isIncome ? 'text-[#008f39] dark:text-[#008f39]' : 'text-[#ef4444] dark:text-[#ef4444]';
  const borderColorClass = isIncome ? 'border-[#008f39]/50' : 'border-[#ef4444]/50';

  // Specific colors for breakdown
  const bankColorClass = 'text-[#3b82f6] dark:text-[#3b82f6]';
  const cashColorClass = 'text-[#008f39] dark:text-[#008f39]';

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="breakdown-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="breakdown-modal-title" className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-gray-500 dark:text-gray-400">Banco / Tarjeta:</span>
            <span className={`font-semibold ${bankColorClass}`}>{formatCurrency(bankAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-gray-500 dark:text-gray-400">Efectivo:</span>
            <span className={`font-semibold ${cashColorClass}`}>{formatCurrency(cashAmount)}</span>
          </div>
          <div className={`pt-4 mt-2 border-t-2 ${borderColorClass} flex justify-between items-center`}>
            <span className="font-bold text-xl text-gray-800 dark:text-gray-200">Total Mensual:</span>
            <span className={`font-bold text-2xl ${totalColorClass}`}>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBreakdownModal;