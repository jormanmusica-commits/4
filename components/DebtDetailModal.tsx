import React, { useMemo } from 'react';
import { Liability, Transaction, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import EditIcon from './icons/EditIcon';

const CASH_METHOD_ID = 'efectivo';

type DebtIncoming = Transaction & { isInitial: boolean };

interface DebtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Liability | null;
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  currency: string;
  onOpenEditDebtAdditionModal: (debt: Liability, addition: DebtIncoming) => void;
}

const DebtDetailModal: React.FC<DebtDetailModalProps> = ({
  isOpen, onClose, debt, transactions, bankAccounts, currency, onOpenEditDebtAdditionModal
}) => {
  if (!isOpen || !debt) return null;

  const formatCurrency = (amount: number) => {
    const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const paidAmount = debt.originalAmount - debt.amount;
  const progress = debt.originalAmount > 0 ? (paidAmount / debt.originalAmount) * 100 : 0;

  const payments = useMemo(() => {
    return transactions
      .filter(t => t.liabilityId === debt.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, debt.id]);

  const debtIncomings: DebtIncoming[] = useMemo(() => {
    const transactionBasedHistory: DebtIncoming[] = transactions
      .filter(t => (t.patrimonioType === 'liability' || t.patrimonioType === 'debt-addition') && t.patrimonioId === debt.id)
      .map(t => ({ ...t, isInitial: false }));

    const initialAdditionsHistory: DebtIncoming[] = (debt.initialAdditions || []).map((add) => ({
      id: add.id,
      description: `Ampliación inicial: ${debt.name}`,
      amount: add.amount,
      date: add.date,
      type: 'income',
      paymentMethodId: '',
      patrimonioId: debt.id,
      patrimonioType: 'debt-addition',
      details: add.details,
      isInitial: true,
    } as DebtIncoming));

    const transactionBasedAmount = transactionBasedHistory.reduce((sum, tx) => sum + tx.amount, 0);
    const initialAdditionsAmount = (debt.initialAdditions || []).reduce((sum, add) => sum + add.amount, 0);
    
    const firstInitialAmount = debt.originalAmount - transactionBasedAmount - initialAdditionsAmount;

    const history: DebtIncoming[] = [...transactionBasedHistory, ...initialAdditionsHistory];

    if (firstInitialAmount > 0.001) {
      history.push({
        id: `${debt.id}-initial-base`,
        description: `Deuda inicial: ${debt.name}`,
        amount: firstInitialAmount,
        date: debt.date,
        type: 'income',
        paymentMethodId: debt.destinationMethodId || '',
        patrimonioId: debt.id,
        patrimonioType: 'liability',
        details: debt.details,
        isInitial: !debt.destinationMethodId,
      } as DebtIncoming);
    }
    
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, debt]);

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
      aria-labelledby="debt-detail-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="debt-detail-modal-title" className="text-xl font-bold truncate">{debt.name}</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Stats and Progress */}
          <div className="space-y-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Deuda Original:</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(debt.originalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Pagado:</span>
                <span className="font-semibold text-green-500">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Restante:</span>
                <span className="font-bold text-red-500">{formatCurrency(debt.amount)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Incomings History */}
            <div>
              <h4 className="font-semibold text-md text-gray-600 dark:text-gray-300 mb-2">Historial de Deuda</h4>
              {debtIncomings.length > 0 ? (
                <ul className="space-y-2">
                  {debtIncomings.map(incoming => {
                    const paymentSource = getPaymentMethodDetails(incoming.paymentMethodId);
                    return (
                      <li key={incoming.id} className="group text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col items-start gap-1">
                            <p className="text-gray-600 dark:text-gray-300">{formatFullDate(incoming.date)}</p>
                            {incoming.isInitial ? (
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
                                <span className="font-semibold text-red-500">{formatCurrency(incoming.amount)}</span>
                                {incoming.isInitial && (
                                    <button
                                        onClick={() => onOpenEditDebtAdditionModal(debt, incoming)}
                                        className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Editar ampliación"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {incoming.details && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 pl-2 border-l-2 border-gray-300 dark:border-gray-600 whitespace-pre-wrap">{incoming.details}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No se han registrado montos para esta deuda.</p>
              )}
            </div>

            {/* Payments History */}
            <div>
              <h4 className="font-semibold text-md text-gray-600 dark:text-gray-300 mb-2">Historial de Pagos</h4>
              {payments.length > 0 ? (
                <ul className="space-y-2">
                  {payments.map(payment => {
                    const paymentSource = getPaymentMethodDetails(payment.paymentMethodId);
                    return (
                      <li key={payment.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <div className="flex flex-col items-start gap-1">
                          <p className="text-gray-600 dark:text-gray-300">{formatFullDate(payment.date)}</p>
                          <span
                            className="px-2 py-0.5 text-xs font-semibold rounded-full"
                            style={{ backgroundColor: `${paymentSource.color}20`, color: paymentSource.color }}
                          >
                            {paymentSource.name}
                          </span>
                        </div>
                        <span className="font-semibold text-orange-500">{formatCurrency(payment.amount)}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No se han registrado pagos para esta deuda.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtDetailModal;