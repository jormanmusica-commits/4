import React, { useState, useMemo, useEffect } from 'react';
import { BankAccount, Page, Transaction } from '../types';
import Summary from '../components/Summary';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import { findFirstDateWithSufficientBalance } from '../utils/transactionUtils';
import AmountInput from '../components/AmountInput';

const CASH_METHOD_ID = 'efectivo';

// FIX: Add currency parameter to format currency dynamically.
const formatCurrency = (amount: number, currency: string) => new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
}).format(amount);

interface TransferenciaProps {
  balance: number;
  balancesByMethod: Record<string, number>;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  onAddTransfer: (fromMethodId: string, toMethodId: string, amount: number, date: string) => string | void;
  onNavigate: (page: Page) => void;
  initialDirection: 'deposit' | 'withdrawal' | null;
  // FIX: Add currency prop.
  currency: string;
}

const Transferencia: React.FC<TransferenciaProps> = ({
  balance, balancesByMethod, bankAccounts, transactions, onAddTransfer, onNavigate, initialDirection, currency
}) => {
  const [fromMethod, setFromMethod] = useState<string>('');
  const [toMethod, setToMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [minDate, setMinDate] = useState('');
  
  useEffect(() => {
    if (initialDirection === 'deposit') { // Cash to Bank
        setFromMethod(CASH_METHOD_ID);
        setToMethod('');
    } else if (initialDirection === 'withdrawal') { // Bank to Cash
        setFromMethod('');
        setToMethod(CASH_METHOD_ID);
    }
  }, [initialDirection]);

  useEffect(() => {
    const numericAmount = parseFloat(amount);
    if (fromMethod && !isNaN(numericAmount) && numericAmount > 0) {
      const firstPossibleDate = findFirstDateWithSufficientBalance(transactions, fromMethod, numericAmount);
      
      setMinDate(firstPossibleDate || '');

      // If a valid minDate is found and the currently selected date is before it,
      // update the selected date to the new minimum. String comparison is safe for YYYY-MM-DD.
      if (firstPossibleDate && date < firstPossibleDate) {
        setDate(firstPossibleDate);
      }
    } else {
      // If no amount or source, remove date restriction
      setMinDate('');
    }
  }, [amount, fromMethod, transactions, date]);

  const paymentMethods = useMemo(() => [
    { id: CASH_METHOD_ID, name: 'Efectivo', balance: balancesByMethod[CASH_METHOD_ID] || 0 },
    ...bankAccounts.map(ba => ({
      id: ba.id,
      name: ba.name,
      balance: balancesByMethod[ba.id] || 0
    }))
  ], [bankAccounts, balancesByMethod]);

  const fromOptions = useMemo(() => {
    if (initialDirection === 'withdrawal') {
        return paymentMethods.filter(pm => pm.id !== CASH_METHOD_ID && pm.balance > 0);
    }
    return paymentMethods.filter(pm => pm.id === CASH_METHOD_ID && pm.balance > 0);
  }, [paymentMethods, initialDirection]);

  const toOptions = useMemo(() => {
    if (initialDirection === 'deposit') {
        return paymentMethods.filter(pm => pm.id !== CASH_METHOD_ID);
    }
    return paymentMethods.filter(pm => pm.id === CASH_METHOD_ID);
  }, [paymentMethods, initialDirection]);
  
  const pageTitle = initialDirection === 'deposit' ? 'Depositar a Banco' : 'Retirar a Efectivo';
  const buttonText = initialDirection === 'deposit' ? 'Realizar Depósito' : 'Realizar Retiro';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (!fromMethod || !toMethod || !amount.trim() || !date.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, introduce una cantidad válida.');
      return;
    }

    const sourceAccount = paymentMethods.find(pm => pm.id === fromMethod);
    if (sourceAccount && sourceAccount.balance < numericAmount) {
      setError('Fondos insuficientes en la cuenta de origen.');
      return;
    }

    const errorMsg = onAddTransfer(fromMethod, toMethod, numericAmount, date);
    if (errorMsg) {
        setError(errorMsg);
    }
  };

  return (
    <div className="animate-fade-in">
        <div className="flex items-center mb-6">
            <button 
                onClick={() => onNavigate('resumen')} 
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Volver a resumen"
            >
                <ArrowLeftIcon />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">
                {pageTitle}
            </h2>
        </div>
        
        <div className="p-4 rounded-xl transition-shadow duration-500 bg-white dark:bg-gray-800/50 ring-4 ring-[#3b82f6]/20 shadow-2xl shadow-[#3b82f6]/30 dark:shadow-[#3b82f6]/20">
            <div className="mb-8">
                <Summary 
                    balance={balance} 
                    balancesByMethod={balancesByMethod} 
                    onCashClick={() => {}}
                    onBankClick={() => {}}
                    currency={currency}
                />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fromMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
                        <select
                            id="fromMethod"
                            value={fromMethod}
                            onChange={(e) => setFromMethod(e.target.value)}
                            disabled={initialDirection === 'deposit'}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-700"
                        >
                            <option value="" disabled>Seleccionar origen</option>
                            {fromOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>
                                    {/* FIX: Pass currency to formatCurrency */}
                                    {opt.name} ({formatCurrency(opt.balance, currency)})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="toMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hacia</label>
                        <select
                            id="toMethod"
                            value={toMethod}
                            onChange={(e) => setToMethod(e.target.value)}
                            disabled={initialDirection === 'withdrawal'}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-700"
                        >
                            <option value="" disabled>Seleccionar destino</option>
                            {toOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <AmountInput
                    value={amount}
                    onChange={setAmount}
                    label="Cantidad"
                    themeColor="#3b82f6"
                    placeholder="100,00"
                    currency={currency}
                />
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        min={minDate}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:[color-scheme:dark]"
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center my-2">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-[#3b82f6] text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out hover:bg-[#2563eb] active:scale-95"
                >
                    {buttonText}
                </button>
            </form>
        </div>
    </div>
  );
};

export default Transferencia;