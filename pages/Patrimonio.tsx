import React, { useMemo, useState } from 'react';
import { Profile, Asset, Liability, Loan, BankAccount, PatrimonioFilters, HistoryItemType, Page } from '../types';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import ArrowDownIcon from '../components/icons/ArrowDownIcon';
import ScaleIcon from '../components/icons/ScaleIcon';
import TrashIcon from '../components/icons/TrashIcon';
import FilterIcon from '../components/icons/FilterIcon';
import PatrimonioFilterPanel from '../components/PatrimonioFilterPanel';
import PatrimonioDetailModal from '../components/PatrimonioDetailModal';

const CASH_METHOD_ID = 'efectivo';

interface PatrimonioProps {
    profile: Profile;
    manualAssetsValue: number;
    totalLiabilities: number;
    totalLoans: number;
    assets: Asset[];
    liabilities: Liability[];
    loans: Loan[];
    bankAccounts: BankAccount[];
    onDeleteAsset: (id: string) => void;
    onDeleteLiability: (id: string) => void;
    onDeleteLoan: (id: string) => void;
    onNavigate: (page: Page) => void;
}

const HistoryItem: React.FC<{
    item: HistoryItemType;
    onDelete: (item: HistoryItemType) => void;
    onItemClick: (item: HistoryItemType) => void;
    formatCurrency: (amount: number) => string;
}> = ({ item, onDelete, onItemClick, formatCurrency }) => {
    const { patrimonioType, name, amount, date } = item;
    const originalAmount = 'originalAmount' in item ? item.originalAmount : amount;
    const isPartial = patrimonioType !== 'asset' && originalAmount && amount < originalAmount;

    const config = useMemo(() => {
        switch (patrimonioType) {
            case 'asset': return {
                icon: <ArrowUpIcon className="w-5 h-5 text-green-500" />,
                bgColorClass: 'bg-green-500/10',
                textColorClass: 'text-green-500',
                displayName: name || 'Ahorro',
                typeLabel: 'Ahorro',
                sign: '+'
            };
            case 'loan': return {
                icon: <ScaleIcon className="w-5 h-5 text-blue-500" />,
                bgColorClass: 'bg-blue-500/10',
                textColorClass: 'text-blue-500',
                displayName: name,
                typeLabel: 'Préstamo',
                sign: '-'
            };
            case 'liability': return {
                icon: <ArrowDownIcon className="w-5 h-5 text-red-500" />,
                bgColorClass: 'bg-red-500/10',
                textColorClass: 'text-red-500',
                displayName: name,
                typeLabel: 'Deuda',
                sign: '+' // Money received
            };
            case 'debt-payment': return {
                icon: <ArrowDownIcon className="w-5 h-5 text-orange-500" />,
                bgColorClass: 'bg-orange-500/10',
                textColorClass: 'text-orange-500',
                displayName: name,
                typeLabel: 'Pago de Deuda',
                sign: '-'
            };
            case 'loan-repayment': return {
                icon: <ArrowUpIcon className="w-5 h-5 text-cyan-500" />,
                bgColorClass: 'bg-cyan-500/10',
                textColorClass: 'text-cyan-500',
                displayName: name,
                typeLabel: 'Reembolso Préstamo',
                sign: '+'
            };
            case 'loan-addition': return {
                icon: <ArrowUpIcon className="w-5 h-5 text-blue-500" />,
                bgColorClass: 'bg-blue-500/10',
                textColorClass: 'text-blue-500',
                displayName: name,
                typeLabel: 'Ampliación Préstamo',
                sign: '-'
            };
            case 'debt-addition': return {
                icon: <ArrowDownIcon className="w-5 h-5 text-red-500" />,
                bgColorClass: 'bg-red-500/10',
                textColorClass: 'text-red-500',
                displayName: name,
                typeLabel: 'Ampliación Deuda',
                sign: '+'
            };
        }
    }, [patrimonioType, name]);
    
    const displayAmount = (patrimonioType === 'loan' || patrimonioType === 'liability') ? originalAmount : amount;

    const subText = useMemo(() => {
        if (!isPartial) return null;
        if (patrimonioType === 'liability') {
            return `Restante de ${formatCurrency(originalAmount)}`;
        }
        return null;
    }, [patrimonioType, isPartial, originalAmount, formatCurrency]);

    const formattedDate = useMemo(() => {
        if (!date) return null;
        const d = new Date(date + 'T00:00:00Z');
        const options: Intl.DateTimeFormatOptions = {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        };
        const formatted = new Intl.DateTimeFormat('es-ES', options).format(d);
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }, [date]);

    const sourceDetails = 'sourceDetails' in item ? item.sourceDetails : null;
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(item);
    }

    return (
        <div 
            onClick={() => onItemClick(item)}
            className="group flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            role="button"
            aria-label={`Ver detalles de ${name}`}
        >
            <div className="flex items-center space-x-4 min-w-0">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bgColorClass}`}>
                    {config.icon}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{config.displayName}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`font-semibold ${config.textColorClass}`}>
                            {config.typeLabel}
                        </span>
                        {sourceDetails && (
                           <span
                             className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full"
                             style={{
                               backgroundColor: `${sourceDetails.color}20`,
                               color: sourceDetails.color
                             }}
                           >
                             {sourceDetails.name}
                           </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                 <div className="text-right">
                    <p className={`font-bold text-lg whitespace-nowrap ${config.textColorClass}`}>{config.sign}{formatCurrency(displayAmount)}</p>
                    {subText && <p className="text-xs text-gray-500 dark:text-gray-400">{subText}</p>}
                    {formattedDate && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formattedDate}</p>}
                </div>
                {(patrimonioType === 'asset' || patrimonioType === 'liability' || patrimonioType === 'loan') && (
                    <button
                        onClick={handleDelete}
                        aria-label={`Eliminar ${name}`}
                        className="p-2 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};


const Patrimonio: React.FC<PatrimonioProps> = ({
    profile, manualAssetsValue, totalLiabilities, totalLoans,
    assets, liabilities, loans, bankAccounts,
    onDeleteAsset, onDeleteLiability, onDeleteLoan,
    onNavigate
}) => {
    const { currency } = profile;
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<PatrimonioFilters | null>(null);
    const [detailPatrimonioItem, setDetailPatrimonioItem] = useState<HistoryItemType | null>(null);

    const formatCurrency = (amount: number) => {
        const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const historyItems: HistoryItemType[] = useMemo(() => {
        const getSourceDetails = (sourceId?: string): { name: string; color: string } | undefined => {
            if (!sourceId) return undefined;
            if (sourceId === CASH_METHOD_ID) return { name: 'Efectivo', color: '#008f39' };
            const bank = bankAccounts.find(b => b.id === sourceId);
            return bank ? { name: bank.name, color: bank.color } : { name: 'Cuenta Eliminada', color: '#64748b' };
        };
        
        const combined: (HistoryItemType & { timestamp: number })[] = [
            // Creations are set to the beginning of the day (00:00 UTC)
            ...assets.map(item => ({ ...item, patrimonioType: 'asset' as const, amount: item.value, sourceDetails: getSourceDetails(item.sourceMethodId), timestamp: new Date(item.date + 'T00:00:00Z').getTime() })),
            ...loans.map(item => ({ ...item, patrimonioType: 'loan' as const, amount: item.amount, sourceDetails: getSourceDetails(item.sourceMethodId), timestamp: new Date(item.date + 'T00:00:00Z').getTime() })),
            ...liabilities.map(item => ({ ...item, patrimonioType: 'liability' as const, amount: item.amount, sourceDetails: getSourceDetails((item as any).destinationMethodId), timestamp: new Date(item.date + 'T00:00:00Z').getTime() })),
        ];
        
        // Payments/repayments from transactions are added with a later time (12:00 UTC)
        // to ensure they appear after creations on the same day when sorted descending.
        profile.data.transactions.forEach(t => {
            // Only consider transactions that are part of the patrimonio history
            if (t.liabilityId || t.loanId || (t.patrimonioType === 'loan-addition' && t.patrimonioId) || (t.patrimonioType === 'debt-addition' && t.patrimonioId)) {
                const paymentTimestamp = new Date(t.date + 'T12:00:00Z').getTime();

                if (t.liabilityId) {
                    const liabilityName = t.description.split(': ')[1] || 'Deuda';
                    combined.push({
                        ...t,
                        timestamp: paymentTimestamp,
                        patrimonioType: 'debt-payment',
                        name: `Pago: ${liabilityName}`,
                    });
                }
                if (t.loanId) {
                    const loanName = t.description.split(': ')[1] || 'Préstamo';
                     combined.push({
                        ...t,
                        timestamp: paymentTimestamp,
                        patrimonioType: 'loan-repayment',
                        name: `Reembolso: ${loanName}`,
                    });
                }
                if (t.patrimonioType === 'loan-addition') {
                    combined.push({
                        ...t,
                        timestamp: paymentTimestamp,
                        patrimonioType: 'loan-addition',
                        name: t.description,
                    });
                }
                 if (t.patrimonioType === 'debt-addition') {
                    combined.push({
                        ...t,
                        timestamp: paymentTimestamp,
                        patrimonioType: 'debt-addition',
                        name: t.description,
                        sourceDetails: getSourceDetails(t.paymentMethodId),
                    });
                }
            }
        });

        // Sort descending: newest items first.
        return combined.sort((a, b) => b.timestamp - a.timestamp);

    }, [assets, loans, liabilities, bankAccounts, profile.data.transactions]);

    const handleApplyFilters = (newFilters: PatrimonioFilters) => {
        const isFilterActive = newFilters.types.length > 0 || newFilters.sources.length > 0;
        setActiveFilters(isFilterActive ? newFilters : null);
        setIsFilterPanelOpen(false);
    };

    const filteredHistoryItems = useMemo(() => {
        if (!activeFilters) return historyItems;

        const { types, sources } = activeFilters;
        const hasTypeFilter = types.length > 0;
        const hasSourceFilter = sources.length > 0;

        return historyItems.filter(item => {
            if (hasTypeFilter && !types.includes(item.patrimonioType)) {
                return false;
            }
            if (hasSourceFilter) {
                if (item.patrimonioType === 'liability') return false; 
                const sourceId = (item as Asset | Loan).sourceMethodId;
                if (!sourceId || !sources.includes(sourceId)) {
                    return false;
                }
            }
            return true;
        });
    }, [historyItems, activeFilters]);

    const handleDelete = (item: HistoryItemType) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar "${item.name}"? Esta acción no se puede deshacer y también eliminará la transacción asociada si existe.`)) return;

        if (item.patrimonioType === 'asset') onDeleteAsset(item.id);
        else if (item.patrimonioType === 'loan') onDeleteLoan(item.id);
        else if (item.patrimonioType === 'liability') onDeleteLiability(item.id);
    };


    const SummaryCard: React.FC<{ title: string, amount: number, colorClass: string, children?: React.ReactNode, onClick?: () => void }> = ({ title, amount, colorClass, children, onClick }) => (
        <div
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : -1}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }} : undefined}
            className={`bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-center flex flex-col justify-between transition-colors w-full ${onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-blue-500/50' : ''}`}
        >
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
                <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{formatCurrency(amount)}</p>
            </div>
            {children && <div className="mt-2">{children}</div>}
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
                Resumen Patrimonio
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard title="Ahorros" amount={manualAssetsValue} colorClass="text-green-500" />
                <SummaryCard 
                    title="Deudas" 
                    amount={totalLiabilities} 
                    colorClass="text-red-500"
                    onClick={liabilities.length > 0 ? () => onNavigate('deudas') : undefined}
                />
                <SummaryCard 
                    title="Préstamos" 
                    amount={totalLoans} 
                    colorClass="text-blue-500" 
                    onClick={loans.length > 0 ? () => onNavigate('prestamos') : undefined}
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historial de Patrimonio</h2>
                    <button
                        onClick={() => setIsFilterPanelOpen(true)}
                        aria-label="Filtrar patrimonio"
                        className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#008f39]"
                    >
                        <FilterIcon className="w-6 h-6" />
                        {activeFilters && (
                            <span className="absolute top-1 right-1 block w-2 h-2 bg-blue-500 rounded-full ring-2 ring-gray-50 dark:ring-black"></span>
                        )}
                    </button>
                </div>
                <div className="space-y-3">
                    {filteredHistoryItems.length > 0 ? (
                        filteredHistoryItems.map(item => <HistoryItem key={`${item.patrimonioType}-${item.id}`} item={item} onDelete={handleDelete} onItemClick={setDetailPatrimonioItem} formatCurrency={formatCurrency} />)
                    ) : (
                        <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-inner">
                            <p className="text-gray-500 dark:text-gray-400">No hay registros en el patrimonio que coincidan con tus filtros.</p>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">¡Intenta ajustar la búsqueda o añade un nuevo registro!</p>
                        </div>
                    )}
                </div>
            </div>
             <PatrimonioFilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                onApply={handleApplyFilters}
                currentFilters={activeFilters}
                bankAccounts={bankAccounts}
            />
             <PatrimonioDetailModal
                isOpen={!!detailPatrimonioItem}
                onClose={() => setDetailPatrimonioItem(null)}
                item={detailPatrimonioItem}
                formatCurrency={formatCurrency}
                bankAccounts={bankAccounts}
            />
        </div>
    );
};

export default Patrimonio;