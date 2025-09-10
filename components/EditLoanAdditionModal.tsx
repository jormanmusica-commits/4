import React, { useState, useEffect } from 'react';
import { Loan } from '../types';
import CloseIcon from './icons/CloseIcon';
import AmountInput from './AmountInput';

type LoanAddition = { id: string; amount: number; date: string; details?: string };

interface EditLoanAdditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { loan: Loan, addition: LoanAddition } | null;
  onUpdate: (loanId: string, additionId: string, newAmount: number, newDetails: string) => void;
  currency: string;
}

const EditLoanAdditionModal: React.FC<EditLoanAdditionModalProps> = ({
  isOpen, onClose, data, onUpdate, currency
}) => {
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (isOpen && data) {
      setAmount(data.addition.amount.toString().replace('.', ','));
      setDetails(data.addition.details || '');
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const { loan, addition } = data;

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
    if (numericAmount < 0) {
      alert('El monto no puede ser negativo.');
      return;
    }
    onUpdate(loan.id, addition.id, numericAmount, details.trim());
  };
  
  const formatCurrency = (value: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-addition-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="edit-addition-modal-title" className="text-xl font-bold">Editar Ampliación</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="text-lg font-medium">{loan.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Préstamo actual: {formatCurrency(loan.amount)}
            </div>
          </div>
          <AmountInput
            value={amount}
            onChange={setAmount}
            label="Monto de la Ampliación"
            themeColor="#3b82f6"
            currency={currency}
            autoFocus
          />
          <div>
            <label htmlFor="addition-edit-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Detalles (Opcional)
            </label>
            <textarea
              id="addition-edit-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Añade una nota sobre esta ampliación..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
            />
          </div>
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors hover:bg-blue-600"
          >
            Guardar Cambios
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EditLoanAdditionModal;
