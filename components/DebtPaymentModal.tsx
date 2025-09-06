import React, { useState, useEffect, useMemo } from 'react';
import { Liability, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import BankIcon from './icons/BankIcon';

const CASH_METHOD_ID = 'efectivo';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  liabilities: Liability[];
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onPayDebts: (liabilityIds: string[], paymentMethodId: string) => void;
  currency: string;
}

const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
  isOpen, onClose, liabilities, bankAccounts, balancesByMethod, onPayDebts, currency
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
    if (isOpen) {
      setSelectedIds([]);
      setError('');
      // Pre-select the first available source if none is selected
      if (!paymentMethodId && paymentSources.length > 0) {
        setPaymentMethodId(paymentSources[0].id);
      }
    }
  }, [isOpen, paymentSources, paymentMethodId]);

  const totalToPay = useMemo(() => {
    return liabilities
      .filter(l => selectedIds.includes(l.id))
      .reduce((sum, l) => sum + l.amount, 0);
  }, [selectedIds, liabilities]);

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    setError('');
    if (selectedIds.length === 0) {
      setError('Debes seleccionar al menos una deuda para pagar.');
      return;
    }
    if (!paymentMethodId) {
      setError('Debes seleccionar un método de pago.');
      return;
    }
    const source = paymentSources.find(s => s.id === paymentMethodId);
    if (!source || source.balance < totalToPay) {
      setError('Fondos insuficientes en la cuenta de origen.');
      return;
    }
    onPayDebts(selectedIds, paymentMethodId);
  };

  if (!isOpen) return null;
  
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
          <h2 id="debt-payment-modal-title" className="text-xl font-bold">Pagar Deudas</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 space-y-3 overflow-y-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400">Selecciona las deudas que quieres liquidar.</p>
          {liabilities.map(liability => (
            <label key={liability.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(liability.id)}
                  onChange={() => handleToggleSelection(liability.id)}
                  className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  style={{accentColor: '#ef4444'}}
                />
                <span className="font-medium">{liability.name}</span>
              </div>
              <span className="font-mono font-semibold text-red-500">{formatCurrency(liability.amount)}</span>
            </label>
          ))}
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-4">
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total a Pagar:</span>
              <span className="font-bold text-red-500">{formatCurrency(totalToPay)}</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pagar con
            </label>
            <select
              id="payment-method"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              disabled={totalToPay <= 0}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-700 transition-colors disabled:opacity-50"
              style={sourceSelectStyle}
            >
              <option value="" disabled>Seleccionar origen</option>
              {paymentSources.map(source => (
                <option key={source.id} value={source.id} disabled={source.balance < totalToPay} style={{ color: 'initial', fontWeight: 'normal' }}>
                  {source.name} ({formatCurrency(source.balance)})
                  {source.balance < totalToPay ? ' - Fondos insuficientes' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <button
            onClick={handleSubmit}
            disabled={totalToPay <= 0 || !paymentMethodId || (paymentSources.find(s => s.id === paymentMethodId)?.balance || 0) < totalToPay}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Pagar {formatCurrency(totalToPay)}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DebtPaymentModal;