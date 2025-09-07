import React, { useState, useEffect, useMemo } from 'react';
import { Loan, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import CustomDatePicker from './CustomDatePicker';

const CASH_METHOD_ID = 'efectivo';

interface LoanRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  bankAccounts: BankAccount[];
  balancesByMethod: Record<string, number>;
  onReceiveLoanPayments: (payments: { loanId: string, amount: number }[], paymentMethodId: string, date: string) => void;
  currency: string;
}

const LoanRepaymentModal: React.FC<LoanRepaymentModalProps> = ({
  isOpen, onClose, loan, bankAccounts, balancesByMethod, onReceiveLoanPayments, currency
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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

  const paymentDestinations = useMemo(() => [
    { id: CASH_METHOD_ID, name: 'Efectivo', balance: balancesByMethod[CASH_METHOD_ID] || 0, color: '#008f39' },
    ...bankAccounts.map(b => ({ id: b.id, name: b.name, balance: balancesByMethod[b.id] || 0, color: b.color }))
  ], [bankAccounts, balancesByMethod]);

  useEffect(() => {
    if (isOpen && loan) {
      setPaymentAmount(loan.amount.toString().replace('.', ','));
      setError('');
      setDate(new Date().toISOString().split('T')[0]);
      if (!paymentMethodId || !paymentDestinations.find(p => p.id === paymentMethodId)) {
        setPaymentMethodId(paymentDestinations.length > 0 ? paymentDestinations[0].id : '');
      }
    }
  }, [isOpen, loan, paymentDestinations, paymentMethodId]);
  
  const numericPaymentAmount = parseFloat((paymentAmount || '0').replace(',', '.'));

  const handleAmountChange = (value: string) => {
    if (!loan) return;

    if (value === '' || /^[0-9]*[.,]?[0-9]{0,2}$/.test(value)) {
        let numericValue = parseFloat(value.replace(',', '.'));
        if (isNaN(numericValue)) numericValue = 0;
        
        if (numericValue > loan.amount) {
            setPaymentAmount(loan.amount.toString().replace('.', ','));
        } else {
            setPaymentAmount(value);
        }
    }
  };

  const handleSubmit = () => {
    if (!loan) return;
    setError('');

    if (numericPaymentAmount <= 0) {
        setError('Debes introducir un monto recibido.');
        return;
    }
    if (!paymentMethodId) {
      setError('Debes seleccionar una cuenta de destino.');
      return;
    }
    if (!date) {
        setError('Debes seleccionar una fecha de pago.');
        return;
    }
    const payment = { loanId: loan.id, amount: numericPaymentAmount };
    onReceiveLoanPayments([payment], paymentMethodId, date);
  };

  if (!isOpen || !loan) return null;
  
  const selectedDestinationDetails = paymentDestinations.find(s => s.id === paymentMethodId);
  const destinationSelectStyle: React.CSSProperties = selectedDestinationDetails ? {
      borderColor: selectedDestinationDetails.color,
      color: selectedDestinationDetails.color,
      fontWeight: '600',
  } : {};

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-repayment-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="loan-repayment-modal-title" className="text-xl font-bold">Recibir Pago de Préstamo</h2>
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
            </div>
             <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monto recibido:</label>
                <div className="relative mt-1">
                    <input
                        type="text"
                        inputMode="decimal"
                        value={paymentAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="w-full pl-3 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
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
            <label htmlFor="payment-destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Depositar en
            </label>
            <select
              id="payment-destination"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              disabled={numericPaymentAmount <= 0}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 transition-colors disabled:opacity-50"
              style={destinationSelectStyle}
            >
              <option value="" disabled>Seleccionar destino</option>
              {paymentDestinations.map(dest => (
                <option key={dest.id} value={dest.id} style={{ color: 'initial', fontWeight: 'normal' }}>
                  {dest.name} ({formatCurrency(dest.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Pago
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
            disabled={numericPaymentAmount <= 0 || !paymentMethodId}
            className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Recibir {formatCurrency(numericPaymentAmount)}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LoanRepaymentModal;