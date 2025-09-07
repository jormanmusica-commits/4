import React, { useMemo } from 'react';
import { HistoryItemType, BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ScaleIcon from './icons/ScaleIcon';

const CASH_METHOD_ID = 'efectivo';

interface PatrimonioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HistoryItemType | null;
  formatCurrency: (amount: number) => string;
  bankAccounts: BankAccount[];
}

const DetailRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700/50">
        <span className="font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className="font-semibold text-right">{children}</div>
    </div>
);

const PatrimonioDetailModal: React.FC<PatrimonioDetailModalProps> = ({ isOpen, onClose, item, formatCurrency, bankAccounts }) => {
    if (!isOpen || !item) return null;

    const { patrimonioType, name, amount, date } = item;
    const sourceDetails = 'sourceDetails' in item ? item.sourceDetails : undefined;
    const originalAmount = 'originalAmount' in item ? item.originalAmount : amount;
    const isPartial = patrimonioType !== 'asset' && originalAmount && amount < originalAmount;
    
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'full',
        timeZone: 'UTC',
    }).format(new Date(date + 'T00:00:00Z'));
    
    const paymentMethod = (patrimonioType === 'debt-payment' || patrimonioType === 'loan-repayment')
      ? item.paymentMethodId === CASH_METHOD_ID
        ? { name: 'Efectivo', color: '#008f39' }
        : bankAccounts.find(b => b.id === item.paymentMethodId) || { name: 'Cuenta Eliminada', color: '#64748b' }
      : null;

    const config = useMemo(() => {
        switch (patrimonioType) {
            case 'asset': return {
                title: 'Detalle de Ahorro',
                icon: <ArrowUpIcon className="w-8 h-8 text-green-500" />,
                colorClass: 'text-green-500',
                sign: '+',
            };
            case 'loan': return {
                title: 'Detalle de Préstamo',
                icon: <ScaleIcon className="w-8 h-8 text-blue-500" />,
                colorClass: 'text-blue-500',
                sign: '-',
            };
            case 'liability': return {
                title: 'Detalle de Deuda',
                icon: <ArrowDownIcon className="w-8 h-8 text-red-500" />,
                colorClass: 'text-red-500',
                sign: '-',
            };
            case 'debt-payment': return {
                title: 'Detalle de Pago',
                icon: <ArrowDownIcon className="w-8 h-8 text-orange-500" />,
                colorClass: 'text-orange-500',
                sign: '-',
            };
            case 'loan-repayment': return {
                title: 'Detalle de Reembolso',
                icon: <ArrowUpIcon className="w-8 h-8 text-cyan-500" />,
                colorClass: 'text-cyan-500',
                sign: '+',
            };
        }
    }, [patrimonioType]);

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="patrimonio-detail-modal-title"
        >
            <div
                className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                            {config.icon}
                        </div>
                        <div>
                            <h2 id="patrimonio-detail-modal-title" className="text-xl font-bold">{config.title}</h2>
                            <p className={`text-2xl font-bold ${config.colorClass}`}>{config.sign}{formatCurrency(amount)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Cerrar modal" className="p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-6 space-y-2">
                    <DetailRow label="Concepto">{name}</DetailRow>
                    <DetailRow label="Fecha">{formattedDate}</DetailRow>
                    {isPartial && <DetailRow label="Monto Original">{formatCurrency(originalAmount)}</DetailRow>}
                    {sourceDetails && (
                        <DetailRow label="Origen">
                           <div className="flex items-center gap-2">
                               <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sourceDetails.color }}></span>
                               <span>{sourceDetails.name}</span>
                           </div>
                        </DetailRow>
                    )}
                    {paymentMethod && (
                        <DetailRow label={patrimonioType === 'debt-payment' ? 'Pagado con' : 'Recibido en'}>
                           <div className="flex items-center gap-2">
                               <span className="w-3 h-3 rounded-full" style={{ backgroundColor: paymentMethod.color }}></span>
                               <span>{paymentMethod.name}</span>
                           </div>
                        </DetailRow>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatrimonioDetailModal;