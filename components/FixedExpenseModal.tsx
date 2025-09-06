import React, { useState, useMemo } from 'react';
import { FixedExpense, Category, Transaction } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import BoltIcon from './icons/BoltIcon';
import CategoryModal from './CategoryModal';
import FoodIcon from './icons/FoodIcon';
import TransportIcon from './icons/TransportIcon';
import ClothingIcon from './icons/ClothingIcon';
import HouseIcon from './icons/HouseIcon';
import EntertainmentIcon from './icons/EntertainmentIcon';
import HealthIcon from './icons/HealthIcon';
import TagIcon from './icons/TagIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import CheckIcon from './icons/CheckIcon';

interface FixedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixedExpenses: FixedExpense[];
  transactions: Transaction[];
  categories: Category[];
  onAddFixedExpense: (name: string, amount: number, categoryId?: string) => void;
  onDeleteFixedExpense: (id: string) => void;
  onSelectFixedExpense?: (expense: FixedExpense) => void;
  currency: string;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
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

const FixedExpenseModal: React.FC<FixedExpenseModalProps> = ({ 
    isOpen, onClose, fixedExpenses, transactions, categories, onAddFixedExpense, onDeleteFixedExpense, onSelectFixedExpense, currency,
    onAddCategory, onUpdateCategory, onDeleteCategory
}) => {
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', categoryId: '' });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const paidExpenseNames = useMemo(() => {
    if (!isOpen) return new Set<string>();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const paidNames = new Set<string>();

    transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'expense' &&
                    transactionDate.getMonth() === currentMonth &&
                    transactionDate.getFullYear() === currentYear;
        })
        .forEach(t => {
            paidNames.add(t.description);
        });
    
    return paidNames;
  }, [transactions, isOpen]);

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const handleSelectCategory = (category: Category) => {
    setNewExpense(prev => ({ ...prev, categoryId: category.id }));
    setIsCategoryModalOpen(false);
  };
  
  if (!isOpen) return null;

  const handleAdd = () => {
    const sanitizedAmount = newExpense.amount.replace(',', '.');
    const numericAmount = parseFloat(sanitizedAmount);
    if (newExpense.name.trim() && !isNaN(numericAmount) && numericAmount > 0) {
      onAddFixedExpense(newExpense.name.trim(), numericAmount, newExpense.categoryId || undefined);
      setNewExpense({ name: '', amount: '', categoryId: '' });
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent selection when deleting
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto fijo?')) {
      onDeleteFixedExpense(id);
    }
  };
  
  const selectedCategory = categories.find(c => c.id === newExpense.categoryId);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fixed-expense-modal-title"
      >
        <div 
          className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="fixed-expense-modal-title" className="text-xl font-bold">Gastos Fijos</h2>
            <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <CloseIcon className="w-6 h-6" />
            </button>
          </header>

          <div className="p-4 space-y-2 overflow-y-auto">
            {fixedExpenses.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay gastos fijos guardados.</p>
            ) : (
              fixedExpenses.map(exp => {
                const category = categories.find(c => c.id === exp.categoryId);
                const isPaid = paidExpenseNames.has(exp.name);

                const itemContent = (
                  <>
                    <div className="flex items-center space-x-4">
                      <BoltIcon className={`w-5 h-5 transition-colors ${isPaid ? 'text-gray-400' : 'text-amber-500'}`} />
                      <div>
                        <span className={`font-semibold transition-colors ${isPaid ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>{exp.name}</span>
                        {category && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.name}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isPaid && (
                            <span title="Pagado este mes">
                                <CheckIcon className="w-5 h-5 text-green-500" />
                            </span>
                        )}
                        <span className={`font-mono transition-colors ${isPaid ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>{formatCurrency(exp.amount)}</span>
                    </div>
                  </>
                );

                return (
                  <div key={exp.id} className="group flex items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                    {onSelectFixedExpense ? (
                      <button
                        onClick={() => onSelectFixedExpense(exp)}
                        className="flex-grow w-full flex items-center justify-between p-3 rounded-lg text-left"
                      >
                        {itemContent}
                      </button>
                    ) : (
                      <div className="flex-grow w-full flex items-center justify-between p-3 rounded-lg text-left">
                        {itemContent}
                      </div>
                    )}
                    <button 
                      onClick={(e) => handleDelete(e, exp.id)} 
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-2"
                      aria-label={`Eliminar ${exp.name}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                  placeholder="Nombre (ej. Alquiler)"
                  className="sm:col-span-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700"
                />
                <input
                  type="text"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  placeholder="Monto"
                  pattern="[0-9]+([,\.][0-9]{1,2})?"
                  inputMode="decimal"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full flex items-center text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {selectedCategory ? (
                      <span className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: `${selectedCategory.color}20`}}>
                              <CategoryIcon iconName={selectedCategory.icon} color={selectedCategory.color} />
                          </div>
                          <span>{selectedCategory.name}</span>
                      </span>
                  ) : (
                      <span className="text-gray-400">Seleccionar categoría (opcional)</span>
                  )}
                </button>
              </div>
              <button
                onClick={handleAdd}
                aria-label="Añadir nuevo gasto fijo"
                className="w-full flex items-center justify-center gap-2 bg-[#008f39] text-white font-bold py-2 px-4 rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                <PlusIcon className="w-5 h-5" /> Añadir Gasto Fijo
              </button>
            </div>
          </footer>
        </div>
      </div>
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSelectCategory={handleSelectCategory}
        onAddCategory={onAddCategory}
        onUpdateCategory={onUpdateCategory}
        onDeleteCategory={onDeleteCategory}
      />
    </>
  );
};

export default FixedExpenseModal;