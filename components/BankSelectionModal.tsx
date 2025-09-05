import React from 'react';
import { BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';

interface BankSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onSelect: (bankId: string) => void;
  onManageBanks: () => void;
  mode: 'income' | 'expense';
  currency: string;
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({ 
    isOpen, onClose, bankAccounts, balancesByMethod, onSelect, onManageBanks, mode, currency
}) => {
  if (!isOpen) return null;
  
  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSelect = (bankId: string) => {
    onSelect(bankId);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-selection-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="bank-selection-modal-title" className="text-xl font-bold">Selecciona una cuenta</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 space-y-3 overflow-y-auto">
          {bankAccounts.map(acc => {
            const balance = balancesByMethod[acc.id] || 0;
            const isDisabled = mode === 'expense' && balance <= 0;
            return (
              <button 
                key={acc.id}
                onClick={() => handleSelect(acc.id)}
                className={`w-full group flex items-center justify-between p-4 rounded-lg text-left transition-colors duration-200 ${
                  isDisabled 
                    ? 'cursor-not-allowed opacity-60' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
                disabled={isDisabled}
              >
                <div className="flex items-center space-x-4">
                  <span className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color }}></span>
                  <span className="font-semibold text-lg">{acc.name}</span>
                </div>
                <span className={`font-mono text-lg ${isDisabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {formatCurrency(balance)}
                </span>
              </button>
            );
          })}
        </div>
        
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <button
                onClick={onManageBanks}
                className="w-full text-center text-sm font-semibold text-gray-600 dark:text-gray-300 py-2 px-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-500/10 transition-colors"
            >
                Gestionar Bancos
            </button>
        </footer>
      </div>
    </div>
  );
};

export default BankSelectionModal;