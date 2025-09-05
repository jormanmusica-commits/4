import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BankAccount, Transaction } from '../types';
import { findFirstDateWithSufficientBalance } from '../utils/transactionUtils';
import AmountInput from './AmountInput';
import CloseIcon from './icons/CloseIcon';
import CalendarIcon from './icons/CalendarIcon';

const CASH_METHOD_ID = 'efectivo';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balancesByMethod: Record<string, number>;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  onAddTransfer: (fromMethodId: string, toMethodId: string, amount: number, date: string) => string | void;
  initialDirection: 'deposit' | 'withdrawal' | null;
  currency: string;
}

const CustomDatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  min?: string;
}> = ({ value, onChange, min }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = new Date(value + 'T00:00:00Z');
  const [viewDate, setViewDate] = useState(selectedDate);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setViewDate(new Date(value + 'T00:00:00Z'));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pickerRef]);

  const minDateObj = min ? new Date(min + 'T00:00:00Z') : null;

  const handleDateSelect = (day: number) => {
    const newDate = new Date(Date.UTC(viewDate.getUTCFullYear(), viewDate.getUTCMonth(), day));
    onChange(newDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(Date.UTC(viewDate.getUTCFullYear(), viewDate.getUTCMonth() + offset, 1)));
  };

  const renderDays = () => {
    const year = viewDate.getUTCFullYear();
    const month = viewDate.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0=Lunes
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`blank-${i}`} className="w-10 h-10" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(Date.UTC(year, month, day));
      if (minDateObj && currentDate < minDateObj) {
        days.push(<div key={`hidden-${day}`} className="w-10 h-10" />);
      } else {
        const isSelected = selectedDate.getUTCFullYear() === year && selectedDate.getUTCMonth() === month && selectedDate.getUTCDate() === day;
        const today = new Date();
        today.setUTCHours(0,0,0,0);
        const isToday = currentDate.getTime() === today.getTime();
        days.push(
          <button
            key={day}
            type="button"
            onClick={() => handleDateSelect(day)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-150 ${
              isSelected
                ? 'bg-[#3b82f6] text-white font-bold'
                : isToday
                ? 'text-[#3b82f6] dark:text-[#3b82f6] bg-gray-200 dark:bg-gray-700'
                : 'text-gray-700 dark:text-gray-300'
            } hover:bg-gray-200 dark:hover:bg-gray-600`}
          >
            {day}
          </button>
        );
      }
    }
    return days;
  };

  const formatFullDate = (dateToFormat: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    };
    const parts = new Intl.DateTimeFormat('es-ES', options).formatToParts(dateToFormat);
    
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  
    const weekday = getPart('weekday');
    const day = getPart('day');
    const month = getPart('month');
    const year = getPart('year');
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    
    return `${capitalize(weekday)} ${day} ${capitalize(month)} ${year}`;
  };

  const formattedSelectedDate = formatFullDate(selectedDate);
  const PrevMonthIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>);
  const NextMonthIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>);

  return (
    <div ref={pickerRef} className="relative">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(o => !o)}
          className="w-full pl-3 pr-10 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {formattedSelectedDate}
        </button>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      {isOpen && (
        <div className="absolute top-full mt-2 z-10 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700 w-full animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><PrevMonthIcon /></button>
            <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>
            <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><NextMonthIcon /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
            <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
          </div>
          <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
        </div>
      )}
    </div>
  );
};


const TransferModal: React.FC<TransferModalProps> = ({
  isOpen, onClose, balancesByMethod, bankAccounts, transactions, onAddTransfer, initialDirection, currency
}) => {
  const [fromMethod, setFromMethod] = useState<string>('');
  const [toMethod, setToMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [minDate, setMinDate] = useState('');

  const formatCurrency = (amountValue: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: amountValue % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amountValue);
  };
  
  useEffect(() => {
    if (isOpen) {
        if (initialDirection === 'deposit') { // Cash to Bank
            setFromMethod(CASH_METHOD_ID);
            setToMethod(bankAccounts.length > 0 ? bankAccounts[0].id : '');
        } else if (initialDirection === 'withdrawal') { // Bank to Cash
            setFromMethod(bankAccounts.length > 0 ? bankAccounts[0].id : '');
            setToMethod(CASH_METHOD_ID);
        }
    } else {
        // Reset form when modal closes
        setFromMethod('');
        setToMethod('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setError('');
    }
  }, [isOpen, initialDirection, bankAccounts]);

  useEffect(() => {
    const numericAmount = parseFloat(amount);
    if (fromMethod && !isNaN(numericAmount) && numericAmount > 0) {
      const firstPossibleDate = findFirstDateWithSufficientBalance(transactions, fromMethod, numericAmount);
      
      setMinDate(firstPossibleDate || '');

      if (firstPossibleDate && date < firstPossibleDate) {
        setDate(firstPossibleDate);
      }
    } else {
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

  const selectedFromMethodDetails = useMemo(() => {
    if (!fromMethod) return null;
    if (fromMethod === CASH_METHOD_ID) {
        return { id: CASH_METHOD_ID, name: 'Efectivo', color: '#008f39' };
    }
    return bankAccounts.find(b => b.id === fromMethod);
}, [fromMethod, bankAccounts]);

const fromSelectStyle: React.CSSProperties = selectedFromMethodDetails ? {
    borderColor: selectedFromMethodDetails.color,
    color: selectedFromMethodDetails.color,
    fontWeight: '600',
} : {};


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="transfer-modal-title" className="text-xl font-bold">{pageTitle}</h2>
            <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <CloseIcon />
            </button>
        </header>
        
        <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fromMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
                        <select
                            id="fromMethod"
                            value={fromMethod}
                            onChange={(e) => setFromMethod(e.target.value)}
                            disabled={initialDirection === 'deposit'}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-700 transition-colors"
                            style={fromSelectStyle}
                        >
                            <option value="" disabled>Seleccionar origen</option>
                            {fromOptions.map(opt => (
                                <option key={opt.id} value={opt.id} style={{ color: 'initial', fontWeight: 'normal' }}>
                                    {opt.name} ({formatCurrency(opt.balance)})
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
                    <CustomDatePicker
                        value={date}
                        onChange={setDate}
                        min={minDate}
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
    </div>
  );
};

export default TransferModal;