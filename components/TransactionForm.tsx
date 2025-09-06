import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';
import FoodIcon from './icons/FoodIcon';
import TransportIcon from './icons/TransportIcon';
import ClothingIcon from './icons/ClothingIcon';
import HouseIcon from './icons/HouseIcon';
import EntertainmentIcon from './icons/EntertainmentIcon';
import HealthIcon from './icons/HealthIcon';
import TagIcon from './icons/TagIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import AmountInput from './AmountInput';
import CustomDatePicker from './CustomDatePicker';

interface TransactionFormProps {
  transactionType: 'income' | 'expense';
  onAddTransaction: (description: string, amount: number, date: string, categoryId?: string) => void;
  currency: string;
  categories?: Category[];
  selectedCategoryId?: string;
  onCategorySelectClick?: () => void;
  minDate?: string;
}

const CategoryIcon: React.FC<{ iconName: string; color: string; }> = ({ iconName, color }) => {
    const iconProps = { className: "w-5 h-5", style: { color } };
    switch (iconName) {
      case 'Food': return <FoodIcon {...iconProps} />;
      case 'Transport': return <TransportIcon {...iconProps} />;
      case 'Clothing': return <ClothingIcon {...iconProps} />;
      case 'House': return <HouseIcon {...iconProps} />;
      case 'Entertainment': return <EntertainmentIcon {...iconProps} />;
      case 'Health': return <HealthIcon {...iconProps} />;
      case 'ArrowDown': return <ArrowDownIcon {...iconProps} />;
      case 'Tag':
      default:
        return <TagIcon {...iconProps} />;
    }
};

const TransactionForm: React.FC<TransactionFormProps> = ({ 
    transactionType, onAddTransaction, categories = [], selectedCategoryId, onCategorySelectClick,
    minDate, currency
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  
  const getInitialDate = () => {
    const today = new Date().toISOString().split('T')[0];
    if (transactionType === 'expense' && minDate && today < minDate) {
        return minDate;
    }
    return today;
  };
  
  const [date, setDate] = useState(getInitialDate());
  const [error, setError] = useState('');
  const [currentCategoryId, setCurrentCategoryId] = useState(selectedCategoryId);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentCategoryId(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    // Adjust date if minDate changes and current date is now invalid.
    if (transactionType === 'expense' && minDate && date < minDate) {
      setDate(minDate);
    }
  }, [minDate, date, transactionType]);

  const isIncome = transactionType === 'income';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (!description.trim() || !amount.trim() || !date.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, introduce una cantidad válida.');
      return;
    }
    if (!isIncome && !currentCategoryId) {
      // No longer required
      // setError('Por favor, selecciona una categoría.');
      // return;
    }

    onAddTransaction(description, numericAmount, date, currentCategoryId);
  };

  const handleAmountSubmitted = () => {
    descriptionInputRef.current?.focus();
  };

  const config = isIncome
    ? {
        title: 'Detalles del Ingreso',
        buttonText: 'Añadir Ingreso',
        buttonClass: 'bg-[#008f39] hover:bg-[#007a33] focus:ring-[#008f39]/50',
        amountLabel: 'Monto',
      }
    : {
        title: 'Detalles del Gasto',
        buttonText: 'Añadir Gasto',
        buttonClass: 'bg-[#ef4444] hover:bg-[#dc2626] focus:ring-[#ef4444]/50',
        amountLabel: 'Monto',
      };

  const selectedCategory = categories.find(c => c.id === currentCategoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg mt-4">
      <h3 className="text-lg font-bold text-center">{config.title}</h3>
      
      <div className="space-y-4">
        <AmountInput
            value={amount}
            onChange={setAmount}
            onSubmitted={handleAmountSubmitted}
            label={config.amountLabel}
            themeColor={isIncome ? '#008f39' : '#ef4444'}
            autoFocus={true}
            placeholder="0,00"
            currency={currency}
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <input
            ref={descriptionInputRef}
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isIncome ? "Ej: Salario" : "Ej: Compra de comida"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008f39]/50 focus:border-[#008f39] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha
          </label>
          <CustomDatePicker
            value={date}
            onChange={setDate}
            min={transactionType === 'expense' ? minDate : undefined}
          />
        </div>

        {!isIncome && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <button
                type="button"
                onClick={onCategorySelectClick}
                className="w-full flex items-center text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {selectedCategory ? (
                  <span className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!isIncome ? 'border-2 border-red-500/50' : ''}`} style={{ backgroundColor: `${selectedCategory.color}20`}}>
                        <CategoryIcon iconName={selectedCategory.icon} color={selectedCategory.color} />
                    </div>
                    <span>{selectedCategory.name}</span>
                  </span>
                ) : (
                  <span className="text-gray-400">Seleccionar categoría</span>
                )}
              </button>
            </div>
        )}

      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        className={`w-full text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 ${config.buttonClass}`}
      >
        {config.buttonText}
      </button>
    </form>
  );
};

export default TransactionForm;