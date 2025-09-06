import React, { useMemo, useState } from 'react';
import { Profile, Asset, Liability, Loan, BankAccount, PatrimonioFilters } from '../types';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import ArrowDownIcon from '../components/icons/ArrowDownIcon';
import ScaleIcon from '../components/icons/ScaleIcon';
import TrashIcon from '../components/icons/TrashIcon';
import FilterIcon from '../components/icons/FilterIcon';
import PatrimonioFilterPanel from '../components/PatrimonioFilterPanel';

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
}

type HistoryItemType = (Asset & { type: 'asset', amount: number, sourceDetails?: { name: string, color: string } }) |
                       (Liability & { type: 'liability', amount: number }) |
                       (Loan & { type: 'loan', amount: number, sourceDetails?: { name: string, color: string } });


const HistoryItem: React.FC<{
    item: HistoryItemType;
    onDelete: (item: HistoryItemType) => void;
    formatCurrency: (amount: number) => string;
}> = ({ item, onDelete, formatCurrency }) => {
    const { type, name, amount, date } = item;

    const config = useMemo(() => {
        switch (type) {
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
                sign: '+'
            };
            case 'liability': return {
                icon: <ArrowDownIcon className="w-5 h-5 text-red-500" />,
                bgColorClass: 'bg-red-500/10',
                textColorClass: 'text-red-500',
                displayName: name,
                typeLabel: 'Deuda',
                sign: '-'
            };
        }
    }, [type, name]);
    
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

    return (
        <div className="group flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
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
                            <>
                                <span>&bull;</span>
                                <span className="font-medium" style={{ color: sourceDetails.color }}>{sourceDetails.name}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                 <div className="text-right">
                    <p className={`font-bold text-lg whitespace-nowrap ${config.textColorClass}`}>{config.sign}{formatCurrency(amount)}</p>
                    {formattedDate && <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>}
                </div>
                <button
                    onClick={() => onDelete(item)}
                    aria-label={`Eliminar ${name}`}
                    className="p-2 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};


const Patrimonio: React.FC<PatrimonioProps> = ({
    profile, manualAssetsValue, totalLiabilities, totalLoans,
    assets, liabilities, loans, bankAccounts,
    onDeleteAsset, onDeleteLiability, onDeleteLoan
}) => {
    const { currency } = profile;
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<PatrimonioFilters | null>(null);

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

        const combined = [
            ...assets.map(item => ({ ...item, type: 'asset' as const, amount: item.value, sourceDetails: getSourceDetails(item.sourceMethodId) })),
            ...loans.map(item => ({ ...item, type: 'loan' as const, amount: item.amount, sourceDetails: getSourceDetails(item.sourceMethodId) })),
            ...liabilities.map(item => ({ ...item, type: 'liability' as const, amount: item.amount })),
        ];
        return combined.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    }, [assets, loans, liabilities, bankAccounts]);

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
            if (hasTypeFilter && !types.includes(item.type)) {
                return false;
            }
            if (hasSourceFilter) {
                if (item.type === 'liability') return false; 
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

        if (item.type === 'asset') onDeleteAsset(item.id);
        else if (item.type === 'loan') onDeleteLoan(item.id);
        else if (item.type === 'liability') onDeleteLiability(item.id);
    };


    const SummaryCard: React.FC<{ title: string, amount: number, colorClass: string }> = ({ title, amount, colorClass }) => (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{formatCurrency(amount)}</p>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
                Resumen Patrimonio
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard title="Ahorros" amount={manualAssetsValue} colorClass="text-green-500" />
                <SummaryCard title="Deudas" amount={totalLiabilities} colorClass="text-red-500" />
                <SummaryCard title="Préstamos" amount={totalLoans} colorClass="text-blue-500" />
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
                        filteredHistoryItems.map(item => <HistoryItem key={`${item.type}-${item.id}`} item={item} onDelete={handleDelete} formatCurrency={formatCurrency} />)
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
        </div>
    );
};

export default Patrimonio;