import React, { useState, useEffect, useMemo } from 'react';
import { Liability, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import CustomDatePicker from './CustomDatePicker';
import AmountInput from './AmountInput';

const CASH_METHOD_ID = 'efectivo';

interface AddValueToDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Liability | null;
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onAddValue: (debtId: string, amount: number, destinationMethodId: string, date: string, isInitial: boolean, details: string) => void;
  currency: string;
}

const AddValueToDebtModal: React.FC<AddValueToDebtModalProps> = ({
  isOpen, onClose, debt, bankAccounts, balancesByMethod, onAddValue, currency
}) => {
  const [amountToAdd, setAmountToAdd] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (isOpen && debt) {
      setAmountToAdd('');
      setError('');
      setDate(new Date().toISOString().split('T')[0]);
      setDetails('');
    }
  }, [isOpen, debt]);
  
  const numericAmountToAdd = parseFloat((amountToAdd || '0').replace(',', '.'));

  const handleSubmit = () => {
    if (!debt) return;
    setError('');

    if (numericAmountToAdd < 0) {
        setError('La cantidad no puede ser negativa.');
        return;
    }
    
    if (!date) {
        setError('Debes seleccionar una fecha.');
        return;
    }
    // Always submit as an "initial" (non-transactional) movement
    onAddValue(debt.id, numericAmountToAdd, '', date, true, details);
  };

  if (!isOpen || !debt) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-value-debt-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="add-value-debt-modal-title" className="text-xl font-bold">Añadir Valor a la Deuda</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Title displayed here */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <span className="font-medium text-lg">{debt.name}</span>
              <span className="font-mono font-semibold text-red-500">{formatCurrency(debt.amount)}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Deuda original: {formatCurrency(debt.originalAmount)}
            </div>
          </div>

          {/* Details */}
          <div>
            <label htmlFor="debt-add-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Detalles (Opcional)
            </label>
            <textarea
              id="debt-add-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Añade una nota sobre esta ampliación..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700"
              autoFocus
            />
          </div>

          {/* Amount */}
          <AmountInput
            value={amountToAdd}
            onChange={setAmountToAdd}
            label="Monto a añadir"
            themeColor="#ef4444"
            currency={currency}
          />

          {/* Date */}
          <div>
            <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha
            </label>
            <CustomDatePicker
              value={date}
              onChange={setDate}
              themeColor="#ef4444"
              displayMode="modal"
            />
          </div>
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
          
          <button
            onClick={handleSubmit}
            disabled={numericAmountToAdd < 0}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Añadir {formatCurrency(numericAmountToAdd)}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AddValueToDebtModal;