import React, { useMemo, useState } from 'react';
import { Transaction, Category, BankAccount } from '../types';
import TrashIcon from './icons/TrashIcon';
import FoodIcon from './icons/FoodIcon';
import TransportIcon from './icons/TransportIcon';
import ClothingIcon from './icons/ClothingIcon';
import HouseIcon from './icons/HouseIcon';
import EntertainmentIcon from './icons/EntertainmentIcon';
import HealthIcon from './icons/HealthIcon';
import TagIcon from './icons/TagIcon';
import SwitchIcon from './icons/SwitchIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ScaleIcon from './icons/ScaleIcon';
import AmountInput from './AmountInput';
import CheckIcon from './icons/CheckIcon';
import CloseIcon from './icons/CloseIcon';

const CASH_METHOD_ID = 'efectivo';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  bankAccounts: BankAccount[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, newDescription: string, newAmount: number) => string | void;
  isEditing: boolean;
  onSetEditing: (id: string | null) => void;
  currency: string;
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
    case 'Scale': return <ScaleIcon {...iconProps} />;
    case 'Tag':
    default:
      return <TagIcon {...iconProps} />;
  }
};

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, category, bankAccounts, onDelete, onUpdate, isEditing, onSetEditing, currency 
}) => {
  const [editedDescription, setEditedDescription] = useState(transaction.description);
  const [editedAmount, setEditedAmount] = useState(String(transaction.amount));

  const isIncome = transaction.type === 'income';
  const isTransfer = !!transaction.transferId;
  const isSaving = !isIncome && !isTransfer && category?.name.toLowerCase() === 'ahorro';
  const canBeEdited = !isTransfer && !transaction.patrimonioId;

  const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: transaction.amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(transaction.amount);

  const formattedDate = useMemo(() => {
    const date = new Date(transaction.date + 'T00:00:00Z');
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    };
    
    const parts = new Intl.DateTimeFormat('es-ES', options).formatToParts(date);
    
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
    
    const weekday = getPart('weekday');
    const day = getPart('day');
    const month = getPart('month');
    const year = getPart('year');
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    
    return `${capitalize(weekday)} ${day} ${capitalize(month)} ${year}`;
  }, [transaction.date]);

  const amountColor = isIncome ? 'text-[#008f39] dark:text-[#008f39]' : 'text-[#ef4444] dark:text-[#ef4444]';
  const sign = isIncome ? '+' : '-';

  const paymentMethodDetails = (() => {
    if (transaction.paymentMethodId === CASH_METHOD_ID) {
      return { name: 'Efectivo', color: '#008f39' };
    }
    const bank = bankAccounts.find(b => b.id === transaction.paymentMethodId);
    if (bank) {
      return { name: bank.name, color: bank.color };
    }
    return { name: 'Cuenta eliminada', color: '#64748b' };
  })();

  const expenseIconBorderClass = isSaving ? 'border-2 border-[#14b8a6]/50' : 'border-2 border-red-500/50';
  const containerBorderClass = isSaving ? 'border-[#14b8a6]' : 'border-gray-200 dark:border-gray-700/50';

  const handleEditClick = () => {
    if (canBeEdited && !isEditing) {
      setEditedDescription(transaction.description);
      setEditedAmount(String(transaction.amount));
      onSetEditing(transaction.id);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetEditing(null);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const numericAmount = parseFloat(editedAmount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
        alert("Por favor, introduce una cantidad válida.");
        return;
    }
    if (!editedDescription.trim()) {
        alert("La descripción no puede estar vacía.");
        return;
    }

    const error = onUpdate(transaction.id, editedDescription, numericAmount);
    if (error) {
        alert(error);
    } else {
        onSetEditing(null);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(transaction.id);
  };

  return (
    <div 
      onClick={handleEditClick} 
      className={`flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl border ${containerBorderClass} transition-all duration-200 ${canBeEdited && !isEditing ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''} ${isEditing ? 'ring-2 ring-blue-500' : ''}`}
      aria-label={isEditing ? `Editando transacción ${transaction.description}` : `Transacción ${transaction.description}`}
    >
      <div className="flex items-center space-x-4 min-w-0 flex-grow">
        {isTransfer ? (
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#3b82f6]/10 border-2 border-[#3b82f6]/50">
            <SwitchIcon className="w-5 h-5 text-[#3b82f6]" />
          </div>
        ) : isIncome ? (
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#008f39]/10 border-2 border-[#008f39]/50">
                <ArrowUpIcon className="w-5 h-5 text-[#008f39]" />
            </div>
        ) : category ? (
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!isIncome ? expenseIconBorderClass : ''}`} style={{ backgroundColor: `${category.color}20` }}>
            <CategoryIcon iconName={category.icon} color={category.color} />
          </div>
        ) : null}
        <div className={`min-w-0 flex-grow ${!category && !isTransfer && !isIncome ? 'ml-14' : ''}`}>
          {isEditing ? (
            <input 
              type="text"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-gray-100 dark:bg-gray-700 rounded p-1 font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{transaction.description}</p>
          )}

          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {isTransfer ? (
              <span className="text-[#3b82f6] dark:text-[#3b82f6] font-medium">Transferencia</span>
            ) : (
              <>
                <span className="font-semibold" style={{ color: paymentMethodDetails.color }}>
                  {paymentMethodDetails.name}
                </span>
                {category && (
                  <>
                    <span>&bull;</span>
                    <span>{category.name}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-right">
          {isEditing ? (
            <div onClick={e => e.stopPropagation()}>
              <AmountInput 
                value={editedAmount}
                onChange={setEditedAmount}
                label=""
                themeColor={isIncome ? '#008f39' : '#ef4444'}
                currency={currency}
              />
            </div>
          ) : (
            <p className={`font-bold ${amountColor} text-lg whitespace-nowrap`}>{sign}{formattedAmount}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formattedDate}</p>
        </div>
        
        {isEditing ? (
            <>
              <button
                onClick={handleSave}
                aria-label="Guardar cambios"
                className="p-2 rounded-full text-green-500 hover:bg-green-500/10 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <CheckIcon className="w-6 h-6" />
              </button>
              <button
                onClick={handleCancel}
                aria-label="Cancelar edición"
                className="p-2 rounded-full text-red-500 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </>
        ) : (
            <button
                onClick={handleDelete}
                aria-label={`Eliminar ${transaction.type}`}
                className="p-2 rounded-full text-gray-400 hover:bg-[#ef4444]/10 dark:hover:bg-[#ef4444]/20 hover:text-[#ef4444] dark:hover:text-[#ef4444] focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;