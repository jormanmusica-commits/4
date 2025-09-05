import React, { useState } from 'react';

interface IncomeFormProps {
  onAddIncome: (description: string, amount: number) => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onAddIncome }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (!description.trim() || !amount.trim()) {
      setError('Ambos campos son obligatorios.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, introduce una cantidad válida.');
      return;
    }

    onAddIncome(description, numericAmount);
    setDescription('');
    setAmount('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-grow">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Salario, Venta de producto"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="w-full md:w-1/3">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cantidad (€)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-[#008f39] text-white font-bold py-2 px-4 rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
      >
        Añadir Ingreso
      </button>
    </form>
  );
};

export default IncomeForm;