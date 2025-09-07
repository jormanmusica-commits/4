import React, { useState, useMemo } from 'react';
import { Page, Liability, Profile, Transaction, BankAccount } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

const CASH_METHOD_ID = 'efectivo';

interface DeudasProps {
  profile: Profile;
  liabilities: Liability[];
  transactions: Transaction[];
  onOpenDebtPaymentModal: (liability: Liability) => void;
  onNavigate: (page: Page) => void;
  currency: string;
}

const Deudas: React.FC<DeudasProps> = ({ profile, liabilities, transactions, onOpenDebtPaymentModal, onNavigate, currency }) => {
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

    const DebtCard: React.FC<{ liability: Liability, bankAccounts: BankAccount[], onRegisterPayment: () => void }> = ({ liability, bankAccounts, onRegisterPayment }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const paidAmount = liability.originalAmount - liability.amount;
        const progress = liability.originalAmount > 0 ? (paidAmount / liability.originalAmount) * 100 : 0;
        
        const payments = useMemo(() => {
            return transactions
                .filter(t => t.liabilityId === liability.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }, [transactions, liability.id]);

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

        const formattedDate = formatFullDate(liability.date);

        return (
            <div
                className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md space-y-3 transition-all duration-300"
            >
                <div className="flex justify-between items-start">
                    <div 
                        className="flex-grow flex items-baseline gap-2 min-w-0 cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">{liability.name}</h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                         <button
                            onClick={(e) => { e.stopPropagation(); onRegisterPayment(); }}
                            className="text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg px-3 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-red-500"
                        >
                            Pagar
                        </button>
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
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Deuda Original:</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(liability.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Pagado:</span>
                        <span className="font-semibold text-green-500">{formatCurrency(paidAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Restante:</span>
                        <span className="font-bold text-red-500">{formatCurrency(liability.amount)}</span>
                    </div>
                </div>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700' : 'max-h-0 opacity-0'}`}>
                    <h4 className="font-semibold text-md text-gray-600 dark:text-gray-300 mb-2">Historial de Pagos</h4>
                    {payments.length > 0 ? (
                        <ul className="space-y-2">
                            {payments.map(payment => {
                                const paymentSource = (() => {
                                    if (payment.paymentMethodId === CASH_METHOD_ID) {
                                        return { name: 'Efectivo', color: '#008f39' };
                                    }
                                    const bank = bankAccounts.find(b => b.id === payment.paymentMethodId);
                                    return bank ? { name: bank.name, color: bank.color } : { name: 'Cuenta Eliminada', color: '#64748b' };
                                })();

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
                    Deudas Activas
                </h1>
            </header>

            <div className="space-y-4">
                {liabilities.length > 0 ? (
                    liabilities.map(liability => <DebtCard key={liability.id} liability={liability} bankAccounts={bankAccounts} onRegisterPayment={() => onOpenDebtPaymentModal(liability)} />)
                ) : (
                    <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-inner">
                        <p className="text-gray-500 dark:text-gray-400">¡Felicidades! No tienes deudas activas en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deudas;