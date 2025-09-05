import React, { useState, useEffect } from 'react';
import { Filters, TransactionTypeFilter, PaymentMethodFilter, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  currentFilters: Filters | null;
  bankAccounts: BankAccount[];
}

const defaultFilters: Filters = {
  startDate: '',
  endDate: '',
  types: [],
  methods: [],
  bankAccounts: [],
};

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onApply, currentFilters, bankAccounts }) => {
  const [localFilters, setLocalFilters] = useState<Filters>(currentFilters || defaultFilters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters || defaultFilters);
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    setLocalFilters(defaultFilters);
    onApply(defaultFilters);
  };

  const handleToggle = <T extends string>(key: keyof Filters, value: T) => {
    setLocalFilters(prev => {
      const currentValues = (prev[key] as T[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      const newFilters = { ...prev, [key]: newValues };

      // Si se deselecciona "bank", limpiar la selección de bancos
      // FIX: Used `value` in `includes` check to satisfy TypeScript generic type constraints.
      if (key === 'methods' && value === 'bank' && !newValues.includes(value)) {
        newFilters.bankAccounts = [];
      }

      return newFilters;
    });
  };

  const typeOptions: { value: TransactionTypeFilter, label: string }[] = [
    { value: 'income', label: 'Ingresos' },
    { value: 'expense', label: 'Gastos' },
    { value: 'transfer', label: 'Transferencias' },
  ];

  const methodOptions: { value: PaymentMethodFilter, label: string }[] = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'bank', label: 'Banco' },
  ];

  const ToggleButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-sm font-semibold rounded-full border-2 transition-colors ${active ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 dark:bg-gray-700 border-transparent'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex flex-col justify-end" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl w-full animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Filtros</h2>
          <button onClick={onClose} aria-label="Cerrar filtros" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Date Range */}
          <div className="space-y-2">
            <h3 className="font-semibold">Rango de Fechas</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={localFilters.startDate} onChange={e => setLocalFilters(f => ({...f, startDate: e.target.value}))} className="input-style" aria-label="Fecha de inicio"/>
              <input type="date" value={localFilters.endDate} onChange={e => setLocalFilters(f => ({...f, endDate: e.target.value}))} className="input-style" aria-label="Fecha de fin"/>
            </div>
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <h3 className="font-semibold">Tipo de Transacción</h3>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(opt => (
                <ToggleButton key={opt.value} active={localFilters.types.includes(opt.value)} onClick={() => handleToggle('types', opt.value)}>
                  {opt.label}
                </ToggleButton>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <h3 className="font-semibold">Método de Pago</h3>
            <div className="flex flex-wrap gap-2">
              {methodOptions.map(opt => (
                <ToggleButton key={opt.value} active={localFilters.methods.includes(opt.value)} onClick={() => handleToggle('methods', opt.value)}>
                  {opt.label}
                </ToggleButton>
              ))}
            </div>
          </div>
          
          {/* Bank Accounts (Conditional) */}
          {localFilters.methods.includes('bank') && (
            <div className="space-y-2 animate-fade-in">
              <h3 className="font-semibold">Cuentas Bancarias</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {bankAccounts.map(acc => (
                  <label key={acc.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={localFilters.bankAccounts.includes(acc.id)}
                      onChange={() => handleToggle('bankAccounts', acc.id)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      style={{accentColor: acc.color}}
                    />
                    <span className="font-medium">{acc.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="grid grid-cols-2 gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleClear} className="w-full font-bold py-3 px-4 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Limpiar Filtros
          </button>
          <button onClick={handleApply} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors">
            Aplicar Filtros
          </button>
        </footer>
        <style>{`
            .input-style {
                padding: 0.5rem 0.75rem;
                border: 1px solid;
                border-radius: 0.375rem;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                outline: none;
            }
            html.dark .input-style {
                background-color: #374151;
                border-color: #4b5563;
                color: #f3f4f6;
                color-scheme: dark;
            }
            html:not(.dark) .input-style {
                background-color: white;
                border-color: #d1d5db;
                color: #111827;
            }
        `}</style>
      </div>
    </div>
  );
};

export default FilterPanel;
