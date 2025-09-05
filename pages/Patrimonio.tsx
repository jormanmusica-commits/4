import React from 'react';
import { Profile, Asset, Liability } from '../types';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditIcon from '../components/icons/EditIcon';

interface PatrimonioProps {
    profile: Profile;
    balance: number;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    onAddAsset: () => void;
    onEditAsset: (asset: Asset) => void;
    onDeleteAsset: (id: string) => void;
    onAddLiability: () => void;
    onEditLiability: (liability: Liability) => void;
    onDeleteLiability: (id: string) => void;
}

const Patrimonio: React.FC<PatrimonioProps> = ({
    profile, balance, totalAssets, totalLiabilities, netWorth,
    onAddAsset, onEditAsset, onDeleteAsset,
    onAddLiability, onEditLiability, onDeleteLiability
}) => {
    const { currency, data: { assets = [], liabilities = [] } } = profile;

    const formatCurrency = (amount: number) => {
        const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const SummaryCard: React.FC<{ title: string, amount: number, colorClass: string }> = ({ title, amount, colorClass }) => (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{formatCurrency(amount)}</p>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
                Dinero Prestado
            </h1>

            {/* Net Worth Summary */}
            <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm dark:border dark:border-gray-800 p-6 rounded-xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <SummaryCard title="Ahorros" amount={totalAssets} colorClass="text-green-500" />
                    <SummaryCard title="Deudas" amount={totalLiabilities} colorClass="text-red-500" />
                    <SummaryCard title="Dinero Prestado" amount={netWorth} colorClass="text-blue-500" />
                </div>
            </div>

            {/* Assets Section */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ahorros</h2>
                    <button
                        onClick={onAddAsset}
                        className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 py-2 px-3 rounded-lg border-2 border-dashed border-green-400/50 dark:border-green-600/50 hover:bg-green-500/10 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" /> Añadir
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <span className="font-semibold">Efectivo y Bancos</span>
                        <span className="font-mono">{formatCurrency(balance)}</span>
                    </div>
                    {assets.map(asset => (
                        <div key={asset.id} className="group flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                            <span className="font-semibold">{asset.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono">{formatCurrency(asset.value)}</span>
                                <button onClick={() => onEditAsset(asset)} className="p-2 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDeleteAsset(asset.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Liabilities Section */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Deudas</h2>
                    <button
                        onClick={onAddLiability}
                        className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 py-2 px-3 rounded-lg border-2 border-dashed border-red-400/50 dark:border-red-600/50 hover:bg-red-500/10 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" /> Añadir
                    </button>
                </div>
                <div className="space-y-3">
                    {liabilities.length === 0 ? (
                         <div className="text-center py-6 px-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
                            <p className="text-gray-500 dark:text-gray-400">¡Felicidades! No tienes deudas registradas.</p>
                         </div>
                    ) : liabilities.map(liability => (
                        <div key={liability.id} className="group flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                            <span className="font-semibold">{liability.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono">{formatCurrency(liability.amount)}</span>
                                <button onClick={() => onEditLiability(liability)} className="p-2 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDeleteLiability(liability.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Patrimonio;