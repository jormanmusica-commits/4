import React, { useMemo } from 'react';
import { Loan, Transaction, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import EditIcon from './icons/EditIcon';

const CASH_METHOD_ID = 'efectivo';

type LoanOutgoing = Transaction & { isInitial: boolean };

interface LoanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  currency: string;
  onOpenEditLoanAdditionModal: (loan: Loan, addition: LoanOutgoing) => void;
}

const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
  isOpen, onClose, loan, transactions, bankAccounts, currency, onOpenEditLoanAdditionModal
}) => {
  if (!isOpen || !loan) return null;

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const paidAmount = loan.originalAmount - loan.amount;
  const progress = loan.originalAmount > 0 ? (paidAmount / loan.originalAmount) * 100 : 0;

  const repayments = useMemo(() => {
    return transactions
      .filter(t => t.loanId === loan.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, loan.id]);

  const loanOutgoings: LoanOutgoing[] = useMemo(() => {
    const transactionBasedHistory: LoanOutgoing[] = transactions
      .filter(t => (t.patrimonioType === 'loan' || t.patrimonioType === 'loan-addition') && t.patrimonioId === loan.id)
      .map(t => ({ ...t, isInitial: false }));

    const initialAdditionsHistory: LoanOutgoing[] = (loan.initialAdditions || []).map((add) => ({
      id: add.id,
      description: `Ampliación inicial: ${loan.name}`,
      amount: add.amount,
      date: add.date,
      type: 'expense',
      paymentMethodId: '',
      patrimonioId: loan.id,
      patrimonioType: 'loan-addition',
      details: add.details,
      isInitial: true,
    } as LoanOutgoing));

    const transactionBasedAmount = transactionBasedHistory.reduce((sum, tx) => sum + tx.amount, 0);
    const initialAdditionsAmount = (loan.initialAdditions || []).reduce((sum, add) => sum + add.amount, 0);
    
    const firstInitialAmount = loan.originalAmount - transactionBasedAmount - initialAdditionsAmount;

    const history: LoanOutgoing[] = [...transactionBasedHistory, ...initialAdditionsHistory];

    if (firstInitialAmount > 0.001) {
      history.push({
        id: `${loan.id}-initial-base`,
        description: `Préstamo inicial: ${loan.name}`,
        amount: firstInitialAmount,
        date: loan.date,
        type: 'expense',
        paymentMethodId: loan.sourceMethodId || '',
        patrimonioId: loan.id,
        patrimonioType: 'loan',
        details: loan.details,
        isInitial: !loan.sourceMethodId,
      } as LoanOutgoing);
    }
    
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

  const getPaymentMethodDetails = (paymentMethodId: string) => {
    if (paymentMethodId === CASH_METHOD_ID) {
      return { name: 'Efectivo', color: '#008f39' };
    }
    const bank = bankAccounts.find(b => b.id === paymentMethodId);
    return bank ? { name: bank.name, color: bank.color } : { name: 'Cuenta Eliminada', color: '#64748b' };
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-detail-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="loan-detail-modal-title" className="text-xl font-bold truncate">{loan.name}</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Stats and Progress */}
          <div className="space-y-3">
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
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Outgoings History */}
            <div>
              <h4 className="font-semibold text-md text-gray-600 dark:text-gray-300 mb-2">Historial de Préstamos</h4>
              {loanOutgoings.length > 0 ? (
                <ul className="space-y-2">
                  {loanOutgoings.map(outgoing => {
                    const paymentSource = getPaymentMethodDetails(outgoing.paymentMethodId);
                    return (
                      <li key={outgoing.id} className="group text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col items-start gap-1">
                            <p className="text-gray-600 dark:text-gray-300">{formatFullDate(outgoing.date)}</p>
                            {outgoing.isInitial ? (
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
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-500">{formatCurrency(outgoing.amount)}</span>
                            {outgoing.isInitial && outgoing.amount === 0 && (
                                <button
                                    onClick={() => onOpenEditLoanAdditionModal(loan, outgoing)}
                                    className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Editar ampliación"
                                >
                                    <EditIcon className="w-4 h-4" />
                                </button>
                            )}
                          </div>
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
    </div>
  );
};

export default LoanDetailModal;