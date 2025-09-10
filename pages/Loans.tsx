import React, { useMemo } from 'react';
import { Page, Loan, Profile, Transaction, BankAccount } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

const CASH_METHOD_ID = 'efectivo';

interface LoansProps {
  profile: Profile;
  loans: Loan[];
  transactions: Transaction[];
  onOpenLoanRepaymentModal: (loan: Loan) => void;
  onOpenAddValueToLoanModal: (loan: Loan) => void;
  onOpenEditLoanModal: (loan: Loan) => void;
  onOpenLoanDetailModal: (loan: Loan) => void;
  onNavigate: (page: Page) => void;
  currency: string;
}

const Loans: React.FC<LoansProps> = ({ profile, loans, transactions, onOpenLoanRepaymentModal, onOpenAddValueToLoanModal, onOpenEditLoanModal, onOpenLoanDetailModal, onNavigate, currency }) => {
    const { data: { bankAccounts } } = profile;
    const formatCurrency = (amount: number) => {
        const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const LoanCard: React.FC<{ loan: Loan, onRegisterPayment: () => void, onAddValue: () => void, onEdit: () => void, onOpenDetails: () => void }> = ({ loan, onRegisterPayment, onAddValue, onEdit, onOpenDetails }) => {
        const paidAmount = loan.originalAmount - loan.amount;
        const progress = loan.originalAmount > 0 ? (paidAmount / loan.originalAmount) * 100 : 0;
        
        const formatFullDate = (dateString: string) => {
            const date = new Date(dateString + 'T00:00:00Z');
            const options: Intl.DateTimeFormatOptions = {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC'
            };
            
            const parts = new Intl.DateTimeFormat('es-ES', options).formatToParts(date);
            const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
            
            const weekday = getPart('weekday');
            const day = getPart('day');
            const month = getPart('month');
            const year = getPart('year');
            
            const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
            
            return `${capitalize(weekday)} ${day} ${capitalize(month)} ${year}`;
        };
        
        const formattedDate = formatFullDate(loan.date);

        return (
            <div
                onClick={onOpenDetails}
                role="button"
                aria-label={`Ver detalles del préstamo ${loan.name}`}
                className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md space-y-3 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
                <div className="flex justify-between items-start">
                    <div 
                        className="flex-grow flex items-baseline gap-2 min-w-0"
                    >
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">{loan.name}</h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{formattedDate}</span>
                    </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Prestado:</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(loan.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Reembolsado:</span>
                        <span className="font-semibold text-green-500">{formatCurrency(paidAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Restante:</span>
                        <span className="font-bold text-blue-500">{formatCurrency(loan.amount)}</span>
                    </div>
                </div>
                
                <div className="flex justify-end pt-2 gap-2">
                     <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-gray-500"
                    >
                        Editar
                    </button>
                     <button
                        onClick={(e) => { e.stopPropagation(); onAddValue(); }}
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                        Añadir Valor
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRegisterPayment(); }}
                        className="text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                        Registrar Reembolso
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            <header className="flex items-center">
                <button
                    onClick={() => onNavigate('patrimonio')}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Volver a patrimonio"
                >
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">
                    Préstamos Activos
                </h1>
            </header>

            <div className="space-y-4">
                {loans.length > 0 ? (
                    loans.map(loan => <LoanCard
                        key={loan.id}
                        loan={loan}
                        onRegisterPayment={() => onOpenLoanRepaymentModal(loan)}
                        onAddValue={() => onOpenAddValueToLoanModal(loan)}
                        onEdit={() => onOpenEditLoanModal(loan)}
                        onOpenDetails={() => onOpenLoanDetailModal(loan)}
                    />)
                ) : (
                    <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-inner">
                        <p className="text-gray-500 dark:text-gray-400">No tienes préstamos activos en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Loans;