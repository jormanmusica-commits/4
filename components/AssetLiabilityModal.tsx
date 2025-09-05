import React, { useState, useEffect } from 'react';
import { Asset, Liability } from '../types';
import CloseIcon from './icons/CloseIcon';
import AmountInput from './AmountInput';

interface AssetLiabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveAsset: (name: string, value: number, id?: string) => void;
    onSaveLiability: (name: string, amount: number, id?: string) => void;
    config: {
        type: 'asset' | 'liability';
        item?: Asset | Liability;
    };
    currency: string;
}

const AssetLiabilityModal: React.FC<AssetLiabilityModalProps> = ({
    isOpen, onClose, onSaveAsset, onSaveLiability, config, currency
}) => {
    const { type, item } = config;
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const isAsset = type === 'asset';
    const isEditing = !!item;

    useEffect(() => {
        if (isOpen && item) {
            setName(item.name);
            setAmount(isAsset ? (item as Asset).value.toString() : (item as Liability).amount.toString());
        } else if (isOpen) {
            setName('');
            setAmount('');
        }
        setError('');
    }, [isOpen, item, isAsset]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (!name.trim() || !amount.trim()) {
            setError('Ambos campos son obligatorios.');
            return;
        }
        if (isNaN(numericAmount) || numericAmount < 0) {
            setError('Por favor, introduce una cantidad válida.');
            return;
        }

        if (isAsset) {
            onSaveAsset(name, numericAmount, item?.id);
        } else {
            onSaveLiability(name, numericAmount, item?.id);
        }
    };

    const modalConfig = isAsset
        ? {
            title: isEditing ? 'Editar Activo' : 'Añadir Activo',
            amountLabel: 'Valor',
            buttonText: 'Guardar Activo',
            themeColor: '#22c55e' // Green
        } : {
            title: isEditing ? 'Editar Pasivo' : 'Añadir Pasivo',
            amountLabel: 'Cantidad',
            buttonText: 'Guardar Pasivo',
            themeColor: '#ef4444' // Red
        };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="asset-liability-modal-title"
        >
            <div
                className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="asset-liability-modal-title" className="text-xl font-bold">{modalConfig.title}</h2>
                    <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <CloseIcon />
                    </button>
                </header>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="item-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={isAsset ? "Ej: Acciones de Apple" : "Ej: Préstamo Coche"}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
                        />
                    </div>
                    <AmountInput
                        value={amount}
                        onChange={setAmount}
                        label={modalConfig.amountLabel}
                        themeColor={modalConfig.themeColor}
                        currency={currency}
                        autoFocus={true}
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>

                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <button
                        onClick={handleSubmit}
                        className="w-full text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                        style={{ backgroundColor: modalConfig.themeColor, '--tw-ring-color': modalConfig.themeColor } as React.CSSProperties}
                    >
                        {modalConfig.buttonText}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AssetLiabilityModal;