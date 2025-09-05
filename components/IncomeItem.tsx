import React, { useMemo } from 'react';
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

const CASH_METHOD_ID = 'efectivo';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  bankAccounts: BankAccount[];
  onDelete: (id: string) => void;
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
    case 'Tag':
    default:
      return <TagIcon {...iconProps} />;
  }
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, category, bankAccounts, onDelete, currency }) => {
  const isIncome = transaction.type === 'income';
  const isTransfer = !!transaction.transferId;

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


  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
      <div className="flex items-center space-x-4 min-w-0">
        {isTransfer ? (
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#3b82f6]/10 border-2 border-[#3b82f6]/50">
            <SwitchIcon className="w-5 h-5 text-[#3b82f6]" />
          </div>
        ) : isIncome ? (
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#008f39]/10 border-2 border-[#008f39]/50">
                <ArrowUpIcon className="w-5 h-5 text-[#008f39]" />
            </div>
        ) : category ? (
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!isIncome ? 'border-2 border-red-500/50' : ''}`} style={{ backgroundColor: `${category.color}20` }}>
            <CategoryIcon iconName={category.icon} color={category.color} />
          </div>
        ) : null}
        <div className={`min-w-0 ${!category && !isTransfer && !isIncome ? 'ml-14' : ''}`}>
          <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{transaction.description}</p>
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
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className={`font-bold ${amountColor} text-lg whitespace-nowrap`}>{sign}{formattedAmount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formattedDate}</p>
        </div>
        <button
          onClick={() => onDelete(transaction.id)}
          aria-label={`Delete ${transaction.type}`}
          className="p-2 rounded-full text-gray-400 hover:bg-[#ef4444]/10 dark:hover:bg-[#ef4444]/20 hover:text-[#ef4444] dark:hover:text-[#ef4444] focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;