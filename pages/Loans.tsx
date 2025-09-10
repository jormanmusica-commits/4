import React, { useState, useMemo } from 'react';
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
  onNavigate: (page: Page) => void;
  currency: string;
}

const Loans: React.FC<LoansProps> = ({ profile, loans, transactions, onOpenLoanRepaymentModal, onOpenAddValueToLoanModal, onOpenEditLoanModal, onNavigate, currency }) => {
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

    const LoanCard: React.FC<{ loan: Loan, bankAccounts: BankAccount[], onRegisterPayment: () => void, onAddValue: () => void, onEdit: () => void }> = ({ loan, bankAccounts, onRegisterPayment, onAddValue, onEdit }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const paidAmount = loan.originalAmount - loan.amount;
        const progress = loan.originalAmount > 0 ? (paidAmount / loan.originalAmount) * 100 : 0;
        
        const repayments = useMemo(() => {
            return transactions
                .filter(t => t.loanId === loan.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }, [transactions, loan.id]);

        const loanOutgoings = useMemo(() => {
            // 1. Get all transaction-based history (creations and additions)
            const transactionBasedHistory = transactions.filter(
                t => (t.patrimonioType === 'loan' || t.patrimonioType === 'loan-addition') && t.patrimonioId === loan.id
            );

            // 2. Create pseudo-transactions for all "initial" additions stored on the loan object
            const initialAdditionsHistory: Transaction[] = (loan.initialAdditions || []).map((add, index) => ({
                id: `${loan.id}-initial-add-${index}`,
                description: `Ampliación inicial: ${loan.name}`,
                amount: add.amount,
                date: add.date,
                type: 'expense',
                paymentMethodId: '', // Key for identifying as initial
                patrimonioId: loan.id,
                patrimonioType: 'loan-addition',
                details: add.details,
            }));

            const transactionBasedAmount = transactionBasedHistory.reduce((sum, tx) => sum + tx.amount, 0);
            const initialAdditionsAmount = (loan.initialAdditions || []).reduce((sum, add) => sum + add.amount, 0);
            
            // 3. Calculate the very first initial amount
            const firstInitialAmount = loan.originalAmount - transactionBasedAmount - initialAdditionsAmount;

            const history: Transaction[] = [...transactionBasedHistory, ...initialAdditionsHistory];

            if (firstInitialAmount > 0.001) {
                history.push({
                    id: `${loan.id}-initial-base`,
                    description: `Préstamo inicial: ${loan.name}`,
                    amount: firstInitialAmount,
                    date: loan.date,
                    type: 'expense',
                    paymentMethodId: loan.sourceMethodId || '', // Empty if truly initial
                    patrimonioId: loan.id,
                    patrimonioType: 'loan',
                    details: loan.details,
                } as Transaction);
            }
            
            // Sort all historical items by date descending
            return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }, [transactions, loan]);

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

        const getPaymentMethodDetails = (paymentMethodId: string) => {
            if (paymentMethodId === CASH_METHOD_ID) {
                return { name: 'Efectivo', color: '#008f39' };
            }
            const bank = bankAccounts.find(b => b.id === paymentMethodId);
            return bank ? { name: bank.name, color: bank.color } : { name: 'Cuenta Eliminada', color: '#64748b' };
        };

        return (
            <div
                className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md space-y-3 transition-all duration-300"
            >
                <div className="flex justify-between items-start">
                    <div 
                        className="flex-grow flex items-baseline gap-2 min-w-0 cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">{loan.name}</h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{formattedDate}</span>
                    </div>
                     <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label={isExpanded ? "Cerrar detalles" : "Abrir detalles"}
                         >
                            <svg className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
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

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-4">
                        {/* Outgoings History */}
                        <div>
                            <h4 className="font-semibold text-md text-gray-600 dark:text-gray-300 mb-2">Historial de Préstamos</h4>
                            {loanOutgoings.length > 0 ? (
                                <ul className="space-y-2">
                                    {loanOutgoings.map(outgoing => {
                                        const paymentSource = getPaymentMethodDetails(outgoing.paymentMethodId);
                                        const isInitialMovement = !outgoing.paymentMethodId;
                                        return (
                                            <li key={outgoing.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <p className="text-gray-600 dark:text-gray-300">{formatFullDate(outgoing.date)}</p>
                                                        {isInitialMovement ? (
                                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                                                Movimiento Inicial
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className="px-2 py-0.5 text-xs font-semibold rounded-full"
                                                                style={{ backgroundColor: `${paymentSource.color}20`, color: paymentSource.color }}
                                                            >
                                                                {paymentSource.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-blue-500">{formatCurrency(outgoing.amount)}</span>
                                                </div>
                                                {outgoing.details && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 pl-2 border-l-2 border-gray-300 dark:border-gray-600 whitespace-pre-wrap">{outgoing.details}</p>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No se han registrado montos para este préstamo.</p>
                            )}
                        </div>

                        {/* Repayments History */}
                        <div>
                            <h4 className="font-semibold text-md text-gray-600 dark:text-gray-300 mb-2">Historial de Reembolsos</h4>
                            {repayments.length > 0 ? (
                                <ul className="space-y-2">
                                    {repayments.map(repayment => {
                                        const paymentDestination = getPaymentMethodDetails(repayment.paymentMethodId);
                                        return (
                                            <li key={repayment.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                <div className="flex flex-col items-start gap-1">
                                                    <p className="text-gray-600 dark:text-gray-300">{formatFullDate(repayment.date)}</p>
                                                    <span
                                                        className="px-2 py-0.5 text-xs font-semibold rounded-full"
                                                        style={{ backgroundColor: `${paymentDestination.color}20`, color: paymentDestination.color }}
                                                    >
                                                        {paymentDestination.name}
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-green-500">{formatCurrency(repayment.amount)}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No se han registrado reembolsos para este préstamo.</p>
                            )}
                        </div>
                    </div>
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
                    loans.map(loan => <LoanCard key={loan.id} loan={loan} bankAccounts={bankAccounts} onRegisterPayment={() => onOpenLoanRepaymentModal(loan)} onAddValue={() => onOpenAddValueToLoanModal(loan)} onEdit={() => onOpenEditLoanModal(loan)} />)
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