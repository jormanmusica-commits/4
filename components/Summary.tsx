import React from 'react';

const CASH_METHOD_ID = 'efectivo';

interface SummaryProps {
  balance: number;
  balancesByMethod: Record<string, number>;
  onCashClick: () => void;
  onBankClick: () => void;
  currency: string;
}

const Summary: React.FC<SummaryProps> = ({ balance, balancesByMethod, onCashClick, onBankClick, currency }) => {
  const cashBalance = balancesByMethod[CASH_METHOD_ID] || 0;
  const bankBalance = Object.entries(balancesByMethod)
      .filter(([id]) => id !== CASH_METHOD_ID)
      .reduce((sum, [, amount]) => sum + amount, 0);

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
      <div className="text-center mb-6">
        <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saldo Actual</h2>
        <p className={`text-4xl font-bold mt-1 ${balance >= 0 ? 'text-amber-500' : 'text-[#ef4444]'}`}>
          <span className={balance >= 0 ? "bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-500" : ""}>
             {formatCurrency(balance)}
          </span>
        </p>
      </div>
      <div className="space-y-2 border-t border-gray-200 dark:border-gray-700/50 pt-4">
        <button
          onClick={onCashClick}
          type="button"
          className="w-full flex justify-between items-center p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#008f39]/50 disabled:cursor-not-allowed"
          aria-label="Depositar efectivo a banco"
          disabled={cashBalance <= 0}
        >
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-[#008f39] rounded-full flex-shrink-0"></span>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Efectivo</h3>
          </div>
          <p className="text-lg font-semibold text-[#008f39] dark:text-[#008f39]">{formatCurrency(cashBalance)}</p>
        </button>
        <button
          onClick={onBankClick}
          type="button"
          className="w-full flex justify-between items-center p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 disabled:cursor-not-allowed"
          aria-label="Retirar efectivo de banco"
          disabled={bankBalance <= 0}
        >
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-[#3b82f6] rounded-full flex-shrink-0"></span>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tarjeta / Banco</h3>
          </div>
          <p className="text-lg font-semibold text-[#3b82f6] dark:text-[#3b82f6]">{formatCurrency(bankBalance)}</p>
        </button>
      </div>
    </div>
  );
};

export default Summary;