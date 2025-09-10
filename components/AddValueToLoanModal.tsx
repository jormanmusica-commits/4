import React, { useState, useEffect, useMemo } from 'react';
import { Loan, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import CustomDatePicker from './CustomDatePicker';
import AmountInput from './AmountInput';

const CASH_METHOD_ID = 'efectivo';

interface AddValueToLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onAddValue: (loanId: string, amount: number, sourceMethodId: string, date: string, isInitial: boolean, details: string) => void;
  currency: string;
}

const AddValueToLoanModal: React.FC<AddValueToLoanModalProps> = ({
  isOpen, onClose, loan, bankAccounts, balancesByMethod, onAddValue, currency
}) => {
  const [amountToAdd, setAmountToAdd] = useState('');
  const [sourceMethodId, setSourceMethodId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInitial, setIsInitial] = useState(false);
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

  const paymentSources = useMemo(() => [
    { id: CASH_METHOD_ID, name: 'Efectivo', balance: balancesByMethod[CASH_METHOD_ID] || 0, color: '#008f39' },
    ...bankAccounts.map(b => ({ id: b.id, name: b.name, balance: balancesByMethod[b.id] || 0, color: b.color }))
  ], [bankAccounts, balancesByMethod]);

  useEffect(() => {
    if (isOpen && loan) {
      setAmountToAdd('');
      setError('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsInitial(false);
      setDetails('');
      if (!sourceMethodId || !paymentSources.find(p => p.id === sourceMethodId)) {
        setSourceMethodId(paymentSources.length > 0 ? paymentSources[0].id : '');
      }
    }
  }, [isOpen, loan, paymentSources, sourceMethodId]);
  
  const numericAmountToAdd = parseFloat((amountToAdd || '0').replace(',', '.'));

  const handleSubmit = () => {
    if (!loan) return;
    setError('');

    if (numericAmountToAdd <= 0) {
        setError('Debes introducir un monto a añadir.');
        return;
    }
    if (!isInitial && !sourceMethodId) {
      setError('Debes seleccionar una cuenta de origen.');
      return;
    }
    if (!isInitial) {
        const source = paymentSources.find(s => s.id === sourceMethodId);
        if (!source || source.balance < numericAmountToAdd) {
            setError('Fondos insuficientes en la cuenta de origen.');
            return;
        }
    }
    if (!date) {
        setError('Debes seleccionar una fecha.');
        return;
    }
    onAddValue(loan.id, numericAmountToAdd, sourceMethodId, date, isInitial, details);
  };

  if (!isOpen || !loan) return null;
  
  const selectedSourceDetails = paymentSources.find(s => s.id === sourceMethodId);
  const sourceSelectStyle: React.CSSProperties = selectedSourceDetails ? {
      borderColor: selectedSourceDetails.color,
      color: selectedSourceDetails.color,
      fontWeight: '600',
  } : {};

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-value-loan-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="add-value-loan-modal-title" className="text-xl font-bold">Añadir Valor al Préstamo</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{loan.name}</span>
                    <span className="font-mono font-semibold text-blue-500">{formatCurrency(loan.amount)}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Monto original: {formatCurrency(loan.originalAmount)}
                </div>
            </div>
            <AmountInput
                value={amountToAdd}
                onChange={setAmountToAdd}
                label="Monto a añadir"
                themeColor="#3b82f6"
                currency={currency}
                autoFocus
            />
             <div>
                <label htmlFor="loan-add-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Detalles (Opcional)
                </label>
                <textarea
                id="loan-add-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Añade una nota sobre esta ampliación..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
                />
            </div>
             <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 pt-2">
                <input
                    type="checkbox"
                    id="is-initial-add-value-checkbox"
                    checked={isInitial}
                    onChange={(e) => setIsInitial(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    style={{ accentColor: '#3b82f6' }}
                />
                <label htmlFor="is-initial-add-value-checkbox" className="cursor-pointer">
                    Registrar como movimiento inicial (no afectará al saldo actual)
                </label>
            </div>
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-4">
          {!isInitial && (
            <div className="animate-fade-in">
                <label htmlFor="source-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Origen de fondos
                </label>
                <select
                id="source-method"
                value={sourceMethodId}
                onChange={(e) => setSourceMethodId(e.target.value)}
                disabled={numericAmountToAdd <= 0}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 transition-colors disabled:opacity-50"
                style={sourceSelectStyle}
                >
                <option value="" disabled>Seleccionar origen</option>
                {paymentSources.map(source => (
                    <option key={source.id} value={source.id} disabled={source.balance < numericAmountToAdd} style={{ color: 'initial', fontWeight: 'normal' }}>
                    {source.name} ({formatCurrency(source.balance)})
                    {source.balance < numericAmountToAdd ? ' - Fondos insuficientes' : ''}
                    </option>
                ))}
                </select>
            </div>
            )}

          <div>
            <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha
            </label>
            <CustomDatePicker
                value={date}
                onChange={setDate}
                themeColor="#3b82f6"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <button
            onClick={handleSubmit}
            disabled={numericAmountToAdd <= 0 || (!isInitial && (!sourceMethodId || (paymentSources.find(s => s.id === sourceMethodId)?.balance || 0) < numericAmountToAdd))}
            className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Añadir {formatCurrency(numericAmountToAdd)}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AddValueToLoanModal;