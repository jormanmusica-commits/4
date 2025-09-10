import React, { useState, useEffect } from 'react';
import { Loan } from '../types';
import CloseIcon from './icons/CloseIcon';

interface EditLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onUpdateLoan: (loanId: string, name: string, details: string) => void;
}

const EditLoanModal: React.FC<EditLoanModalProps> = ({
  isOpen, onClose, loan, onUpdateLoan
}) => {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (isOpen && loan) {
      setName(loan.name);
      setDetails(loan.details || '');
    }
  }, [isOpen, loan]);

  if (!isOpen || !loan) return null;

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('El nombre del préstamo no puede estar vacío.');
      return;
    }
    onUpdateLoan(loan.id, name.trim(), details.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-loan-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="edit-loan-modal-title" className="text-xl font-bold">Editar Préstamo</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="loan-edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Préstamo
            </label>
            <input
              type="text"
              id="loan-edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="loan-edit-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Detalles (Opcional)
            </label>
            <textarea
              id="loan-edit-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Añade una nota sobre este préstamo..."
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

export default EditLoanModal;