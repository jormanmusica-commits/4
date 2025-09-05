import React, { useState, useEffect, useRef } from 'react';
import CalendarIcon from './icons/CalendarIcon';
import { Category } from '../types';
import FoodIcon from './icons/FoodIcon';
import TransportIcon from './icons/TransportIcon';
import ClothingIcon from './icons/ClothingIcon';
import HouseIcon from './icons/HouseIcon';
import EntertainmentIcon from './icons/EntertainmentIcon';
import HealthIcon from './icons/HealthIcon';
import TagIcon from './icons/TagIcon';
import BoltIcon from './icons/BoltIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import AmountInput from './AmountInput';

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
                ? 'bg-[#008f39] text-white font-bold'
                : isToday
                ? 'text-[#008f39] dark:text-[#008f39] bg-gray-200 dark:bg-gray-700'
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
          className="w-full pl-3 pr-10 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008f39]/50 focus:border-[#008f39] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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