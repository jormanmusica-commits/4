import React, { useState, useEffect, useMemo } from 'react';
import { Liability, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import BankIcon from './icons/BankIcon';

const CASH_METHOD_ID = 'efectivo';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  liability: Liability | null;
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onPayDebts: (payments: { liabilityId: string, amount: number }[], paymentMethodId: string) => void;
  currency: string;
}

const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
  isOpen, onClose, liability, bankAccounts, balancesByMethod, onPayDebts, currency
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
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
    if (isOpen && liability) {
      setPaymentAmount(liability.amount.toString().replace('.', ','));
      setError('');
      // Pre-select the first available source if none is selected or the current one is invalid
      if (!paymentMethodId || !paymentSources.find(p => p.id === paymentMethodId)) {
        setPaymentMethodId(paymentSources.length > 0 ? paymentSources[0].id : '');
      }
    }
  }, [isOpen, liability, paymentMethodId, paymentSources]);

  const numericPaymentAmount = parseFloat((paymentAmount || '0').replace(',', '.'));
  
  const handleAmountChange = (value: string) => {
    if (!liability) return;

    if (value === '' || /^[0-9]*[.,]?[0-9]{0,2}$/.test(value)) {
        let numericValue = parseFloat(value.replace(',', '.'));
        if (isNaN(numericValue)) numericValue = 0;
        
        if (numericValue > liability.amount) {
            setPaymentAmount(liability.amount.toString().replace('.', ','));
        } else {
            setPaymentAmount(value);
        }
    }
  };

  const handleSubmit = () => {
    if (!liability) return;
    setError('');

    if (numericPaymentAmount <= 0) {
        setError('Debes introducir un monto a pagar.');
        return;
    }
    if (!paymentMethodId) {
      setError('Debes seleccionar un método de pago.');
      return;
    }
    const source = paymentSources.find(s => s.id === paymentMethodId);
    if (!source || source.balance < numericPaymentAmount) {
      setError('Fondos insuficientes en la cuenta de origen.');
      return;
    }
    const payment = { liabilityId: liability.id, amount: numericPaymentAmount };
    onPayDebts([payment], paymentMethodId);
  };

  if (!isOpen || !liability) return null;
  
  const selectedSourceDetails = paymentSources.find(s => s.id === paymentMethodId);
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
      aria-labelledby="debt-payment-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="debt-payment-modal-title" className="text-xl font-bold">Pagar Deuda</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{liability.name}</span>
                    <span className="font-mono font-semibold text-red-500">{formatCurrency(liability.amount)}</span>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monto a pagar:</label>
                <div className="relative mt-1">
                    <input
                        type="text"
                        inputMode="decimal"
                        value={paymentAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="w-full pl-3 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700"
                        autoFocus
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 font-semibold">
                        {currency}
                    </span>
                </div>
            </div>
        </div>


        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-4">
          <div>
            <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pagar con
            </label>
            <select
              id="payment-method"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              disabled={numericPaymentAmount <= 0}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 transition-colors disabled:opacity-50"
              style={sourceSelectStyle}
            >
              <option value="" disabled>Seleccionar origen</option>
              {paymentSources.map(source => (
                <option key={source.id} value={source.id} disabled={source.balance < numericPaymentAmount} style={{ color: 'initial', fontWeight: 'normal' }}>
                  {source.name} ({formatCurrency(source.balance)})
                  {source.balance < numericPaymentAmount ? ' - Fondos insuficientes' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <button
            onClick={handleSubmit}
            disabled={numericPaymentAmount <= 0 || !paymentMethodId || (paymentSources.find(s => s.id === paymentMethodId)?.balance || 0) < numericPaymentAmount}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Pagar {formatCurrency(numericPaymentAmount)}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DebtPaymentModal;