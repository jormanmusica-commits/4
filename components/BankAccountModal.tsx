import React, { useState, useEffect } from 'react';
import { BankAccount } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import CheckIcon from './icons/CheckIcon';
import BankIcon from './icons/BankIcon';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  onAddBankAccount: (name: string, color: string) => void;
  onUpdateBankAccount: (id: string, name: string, color: string) => void;
  onDeleteBankAccount: (id: string) => void;
}

const colorOptions = [
  '#ef4444', '#f87171', '#f97316', '#fb923c',
  '#eab308', '#facc15', '#22c55e', '#4ade80',
  '#16a34a', '#008f39', '#14b8a6', '#2dd4bf',
  '#3b82f6', '#60a5fa', '#6366f1', '#818cf8',
  '#8b5cf6', '#a78bfa', '#ec4899', '#f472b6',
  '#d946ef', '#e879f9', '#64748b', '#94a3b8',
];

const BankAccountModal: React.FC<BankAccountModalProps> = ({ 
    isOpen, onClose, bankAccounts, onAddBankAccount, onUpdateBankAccount, onDeleteBankAccount 
}) => {
  const [newBankAccount, setNewBankAccount] = useState({ name: '', color: colorOptions[0] });
  const [editingBankAccount, setEditingBankAccount] = useState<{id: string, name: string, color: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
        setNewBankAccount({ name: '', color: colorOptions[0] });
        setEditingBankAccount(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newBankAccount.name.trim()) {
      onAddBankAccount(newBankAccount.name.trim(), newBankAccount.color);
      setNewBankAccount({ name: '', color: colorOptions[0] });
    }
  };

  const handleUpdate = () => {
    if (editingBankAccount && editingBankAccount.name.trim()) {
      onUpdateBankAccount(editingBankAccount.id, editingBankAccount.name.trim(), editingBankAccount.color);
      setEditingBankAccount(null);
    }
  };

  const handleDelete = (id: string) => {
    if (bankAccounts.length <= 1) {
      alert("No puedes eliminar la última cuenta bancaria.");
      return;
    }
    if (window.confirm('¿Estás seguro de que quieres eliminar este banco? Esta acción no se puede deshacer.')) {
      onDeleteBankAccount(id);
    }
  };
  
  const ColorPicker: React.FC<{selectedColor: string, onSelect: (color: string) => void}> = ({ selectedColor, onSelect }) => (
    <div className="grid grid-cols-8 gap-2 my-2">
      {colorOptions.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className="w-full aspect-square rounded-lg transition-transform duration-150 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-white flex items-center justify-center"
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        >
          {selectedColor === color && <CheckIcon className="w-5 h-5 text-white drop-shadow-md" />}
        </button>
      ))}
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-account-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="bank-account-modal-title" className="text-xl font-bold">Gestionar Bancos</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 space-y-2 overflow-y-auto">
          {bankAccounts.map(acc => (
            <div key={acc.id} className="group flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50">
              {editingBankAccount?.id === acc.id ? (
                <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={editingBankAccount.name}
                            onChange={(e) => setEditingBankAccount({ ...editingBankAccount, name: e.target.value })}
                            className="w-full px-2 py-1 border border-[#008f39] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-[#008f39]"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                        />
                        <button onClick={handleUpdate} className="p-2 text-[#008f39] hover:text-[#007a33] transition-colors">
                            <CheckIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <ColorPicker selectedColor={editingBankAccount.color} onSelect={(color) => setEditingBankAccount({...editingBankAccount, color})} />
                </div>
              ) : (
                <div className="flex-grow flex items-center space-x-4 text-left p-2">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${acc.color}20`}}>
                        <BankIcon className="w-5 h-5" style={{ color: acc.color }} />
                    </div>
                  <span>{acc.name}</span>
                </div>
              )}
              
              {editingBankAccount?.id !== acc.id && (
                <div className="flex items-center space-x-1">
                    <button onClick={() => setEditingBankAccount({ id: acc.id, name: acc.name, color: acc.color })} className="p-2 text-gray-400 hover:text-[#3b82f6] transition-colors">
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(acc.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="space-y-3">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newBankAccount.name}
                    onChange={(e) => setNewBankAccount({...newBankAccount, name: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Nombre del nuevo banco..."
                    className="flex-grow w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700"
                />
                <button
                    onClick={handleAdd}
                    aria-label="Añadir nuevo banco"
                    className="flex-shrink-0 bg-[#008f39] text-white p-2 rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
            <ColorPicker selectedColor={newBankAccount.color} onSelect={(color) => setNewBankAccount({...newBankAccount, color})} />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BankAccountModal;