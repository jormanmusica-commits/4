import React from 'react';

interface GlobalSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  currency: string;
}

const GlobalSummary: React.FC<GlobalSummaryProps> = ({ totalIncome, totalExpenses, currency }) => {
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
        Resumen Global
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income Box */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            INGRESOS (TOTAL)
          </h3>
          <p className="text-3xl font-bold mt-1 text-[#008f39] dark:text-[#008f39]">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        
        {/* Expense Box */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            GASTOS (TOTAL)
          </h3>
          <p className="text-3xl font-bold mt-1 text-[#ef4444] dark:text-[#ef4444]">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalSummary;