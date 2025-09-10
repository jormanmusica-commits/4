import React, { useState, useEffect } from 'react';
import { PatrimonioFilters, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';

interface PatrimonioFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: PatrimonioFilters) => void;
  currentFilters: PatrimonioFilters | null;
  bankAccounts: BankAccount[];
}

const defaultFilters: PatrimonioFilters = {
  types: [],
  sources: [],
};

const PatrimonioFilterPanel: React.FC<PatrimonioFilterPanelProps> = ({ isOpen, onClose, onApply, currentFilters, bankAccounts }) => {
  const [localFilters, setLocalFilters] = useState<PatrimonioFilters>(currentFilters || defaultFilters);

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

  const handleToggle = <T extends string>(key: keyof PatrimonioFilters, value: T) => {
    setLocalFilters(prev => {
      const currentValues = (prev[key] as T[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [key]: newValues };
    });
  };

  // FIX: Added 'debt-payment' and 'loan-repayment' to the filter options to align with the updated `PatrimonioFilters` type.
  const typeOptions: { value: 'asset' | 'loan' | 'liability' | 'debt-payment' | 'loan-repayment' | 'loan-addition' | 'debt-addition', label: string }[] = [
    { value: 'asset', label: 'Ahorros' },
    { value: 'loan', label: 'Préstamos (Creación)' },
    { value: 'liability', label: 'Deudas' },
    { value: 'debt-payment', label: 'Pagos de Deudas' },
    { value: 'loan-repayment', label: 'Reembolsos Préstamo' },
    { value: 'loan-addition', label: 'Ampliación Préstamo' },
    { value: 'debt-addition', label: 'Ampliación Deuda' },
  ];

  const sourceOptions = [
    { id: 'efectivo', name: 'Efectivo', color: '#008f39' },
    ...bankAccounts
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
          <h2 className="text-xl font-bold">Filtros de Patrimonio</h2>
          <button onClick={onClose} aria-label="Cerrar filtros" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Item Type */}
          <div className="space-y-2">
            <h3 className="font-semibold">Tipo</h3>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(opt => (
                <ToggleButton key={opt.value} active={localFilters.types.includes(opt.value)} onClick={() => handleToggle('types', opt.value)}>
                  {opt.label}
                </ToggleButton>
              ))}
            </div>
          </div>

          {/* Source of Funds */}
          <div className="space-y-2">
            <h3 className="font-semibold">Origen de Fondos</h3>
             <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {sourceOptions.map(source => (
                  <label key={source.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={localFilters.sources.includes(source.id)}
                      onChange={() => handleToggle('sources', source.id)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      style={{accentColor: source.color}}
                    />
                    <span className="font-medium">{source.name}</span>
                  </label>
                ))}
              </div>
          </div>
        </div>

        <footer className="grid grid-cols-2 gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleClear} className="w-full font-bold py-3 px-4 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Limpiar Filtros
          </button>
          <button onClick={handleApply} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors">
            Aplicar Filtros
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PatrimonioFilterPanel;