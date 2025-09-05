import React from 'react';

interface MonthlySummaryProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  onIncomeClick: () => void;
  onExpenseClick: () => void;
  currency: string;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ monthlyIncome, monthlyExpenses, onIncomeClick, onExpenseClick, currency }) => {
  
  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm dark:border dark:border-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">
        Resumen Mensual
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income Box */}
        <button
          onClick={onIncomeClick}
          className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008f39]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-label="Ver desglose de ingresos mensuales"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Ingresos (Este Mes)
          </h3>
          <p className="text-3xl font-bold mt-1 text-[#008f39] dark:text-[#008f39]">
            {formatCurrency(monthlyIncome)}
          </p>
        </button>

        {/* Expense Box */}
        <button
          onClick={onExpenseClick}
          className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-label="Ver desglose de gastos mensuales"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Gastos (Este Mes)
          </h3>
          <p className="text-3xl font-bold mt-1 text-[#ef4444] dark:text-[#ef4444]">
            {formatCurrency(monthlyExpenses)}
          </p>
        </button>
      </div>
    </div>
  );
};

export default MonthlySummary;