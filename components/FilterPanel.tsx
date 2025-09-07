import React, { useState, useEffect, useMemo } from 'react';
import { Filters, TransactionTypeFilter, PaymentMethodFilter, BankAccount, Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import FoodIcon from './icons/FoodIcon';
import TransportIcon from './icons/TransportIcon';
import ClothingIcon from './icons/ClothingIcon';
import HouseIcon from './icons/HouseIcon';
import EntertainmentIcon from './icons/EntertainmentIcon';
import HealthIcon from './icons/HealthIcon';
import TagIcon from './icons/TagIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ScaleIcon from './icons/ScaleIcon';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  currentFilters: Filters | null;
  bankAccounts: BankAccount[];
  categories: Category[];
}

const defaultFilters: Filters = {
  startDate: '',
  endDate: '',
  types: [],
  methods: [],
  bankAccounts: [],
  categories: [],
};

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
    case 'Scale': return <ScaleIcon {...iconProps} />;
    case 'Tag':
    default:
      return <TagIcon {...iconProps} />;
  }
};

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onApply, currentFilters, bankAccounts, categories }) => {
  const [localFilters, setLocalFilters] = useState<Filters>(currentFilters || defaultFilters);
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters || defaultFilters);
      setCategorySearch('');
    }
  }, [isOpen, currentFilters]);

  const isCategoryFilterDisabled = useMemo(() => {
    const relevantTypes: TransactionTypeFilter[] = ['expense', 'saving', 'loan'];
    // Disable if a type filter is active AND none of the selected types are relevant for categories.
    return localFilters.types.length > 0 && !localFilters.types.some(type => relevantTypes.includes(type));
  }, [localFilters.types]);
  
  useEffect(() => {
    // When the category filter becomes disabled, clear any selected categories
    if (isCategoryFilterDisabled) {
      setLocalFilters(prev => ({...prev, categories: []}));
    }
  }, [isCategoryFilterDisabled]);

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

      // If "bank" method is deselected, also clear selected bank accounts
      // FIX: Removed incorrect type assertion `as PaymentMethodFilter`. The `value` is already of the correct generic type `T` for the `includes` method on `T[]`.
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
    { value: 'saving', label: 'Ahorros' },
    { value: 'loan', label: 'Préstamos' },
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
        className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl w-full max-w-md animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Filtros</h2>
          <button onClick={onClose} aria-label="Cerrar filtros" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          
          <section aria-labelledby="date-range-heading">
            <h3 id="date-range-heading" className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Rango de Fechas</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={localFilters.startDate} onChange={e => setLocalFilters(f => ({...f, startDate: e.target.value}))} className="input-style" aria-label="Fecha de inicio"/>
              <input type="date" value={localFilters.endDate} onChange={e => setLocalFilters(f => ({...f, endDate: e.target.value}))} min={localFilters.startDate} className="input-style" aria-label="Fecha de fin"/>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700/50" />
          
          <section aria-labelledby="transaction-type-heading">
            <h3 id="transaction-type-heading" className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Tipo de Transacción</h3>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(opt => (
                <ToggleButton key={opt.value} active={localFilters.types.includes(opt.value)} onClick={() => handleToggle('types', opt.value)}>
                  {opt.label}
                </ToggleButton>
              ))}
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700/50" />
          
          <section aria-labelledby="payment-method-heading">
            <h3 id="payment-method-heading" className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Método de Pago</h3>
            <div className="flex flex-wrap gap-2">
              {methodOptions.map(opt => (
                <ToggleButton key={opt.value} active={localFilters.methods.includes(opt.value)} onClick={() => handleToggle('methods', opt.value)}>
                  {opt.label}
                </ToggleButton>
              ))}
            </div>
            
            {localFilters.methods.includes('bank') && (
              <div className="mt-4 space-y-2 animate-fade-in">
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Cuentas Bancarias</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                  {bankAccounts.map(acc => (
                    <label key={acc.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
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
          </section>

          <hr className="border-gray-200 dark:border-gray-700/50" />

          <section aria-labelledby="categories-heading" className={`transition-opacity duration-300 ${isCategoryFilterDisabled ? 'opacity-50' : ''}`}>
            <h3 id="categories-heading" className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Categorías</h3>
             {isCategoryFilterDisabled && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 -mt-1">
                Las categorías solo aplican a gastos, ahorros y préstamos.
              </p>
            )}
            <div className={isCategoryFilterDisabled ? 'pointer-events-none' : ''}>
              <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  className="input-style w-full mb-2"
                  disabled={isCategoryFilterDisabled}
              />
              <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                {categories
                  .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map(cat => (
                  <label key={cat.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.categories.includes(cat.id)}
                      onChange={() => handleToggle('categories', cat.id)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      style={{ accentColor: cat.color }}
                      disabled={isCategoryFilterDisabled}
                    />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                            <CategoryIcon iconName={cat.icon} color={cat.color} />
                        </div>
                        <span className="font-medium">{cat.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>
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