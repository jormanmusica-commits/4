import React from 'react';
import { Page, Liability, Profile } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

interface DeudasProps {
  profile: Profile;
  liabilities: Liability[];
  onOpenDebtPaymentModal: (liability: Liability) => void;
  onOpenAddValueToDebtModal: (liability: Liability) => void;
  onOpenEditDebtModal: (liability: Liability) => void;
  onOpenDebtDetailModal: (liability: Liability) => void;
  onNavigate: (page: Page) => void;
  currency: string;
}

const Deudas: React.FC<DeudasProps> = ({ profile, liabilities, onOpenDebtPaymentModal, onOpenAddValueToDebtModal, onOpenEditDebtModal, onOpenDebtDetailModal, onNavigate, currency }) => {
    
    const formatCurrency = (amount: number) => {
        const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const DebtCard: React.FC<{ liability: Liability, onRegisterPayment: () => void, onAddValue: () => void, onEdit: () => void, onOpenDetails: () => void }> = ({ liability, onRegisterPayment, onAddValue, onEdit, onOpenDetails }) => {
        const paidAmount = liability.originalAmount - liability.amount;
        const progress = liability.originalAmount > 0 ? (paidAmount / liability.originalAmount) * 100 : 0;
        
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
                onClick={onOpenDetails}
                role="button"
                aria-label={`Ver detalles de la deuda ${liability.name}`}
                className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md space-y-3 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
                <div className="flex justify-between items-start">
                    <div 
                        className="flex-grow flex items-baseline gap-2 min-w-0"
                    >
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">{liability.name}</h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{formattedDate}</span>
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
                
                <div className="flex justify-end pt-2 gap-2">
                     <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-gray-500"
                    >
                        Editar
                    </button>
                     <button
                        onClick={(e) => { e.stopPropagation(); onAddValue(); }}
                        className="text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-red-500"
                    >
                        Añadir Valor
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRegisterPayment(); }}
                        className="text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-red-500"
                    >
                        Pagar
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
                    Deudas Activas
                </h1>
            </header>

            <div className="space-y-4">
                {liabilities.length > 0 ? (
                    liabilities.map(liability => <DebtCard 
                        key={liability.id} 
                        liability={liability} 
                        onRegisterPayment={() => onOpenDebtPaymentModal(liability)}
                        onAddValue={() => onOpenAddValueToDebtModal(liability)}
                        onEdit={() => onOpenEditDebtModal(liability)}
                        onOpenDetails={() => onOpenDebtDetailModal(liability)}
                    />)
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