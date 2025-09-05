import React, { useState } from 'react';
import { Category } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import CheckIcon from './icons/CheckIcon';
import FoodIcon from './icons/FoodIcon';
import TransportIcon from './icons/TransportIcon';
import ClothingIcon from './icons/ClothingIcon';
import HouseIcon from './icons/HouseIcon';
import EntertainmentIcon from './icons/EntertainmentIcon';
import HealthIcon from './icons/HealthIcon';
import TagIcon from './icons/TagIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSelectCategory?: (category: Category) => void;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

const CategoryIcon: React.FC<{ iconName: string; color: string; }> = ({ iconName, color }) => {
  const iconProps = { className: "w-5 h-5", style: { color } };
  switch (iconName) {
    case 'Food': return <FoodIcon {...iconProps} />;
    case 'Transport': return <TransportIcon {...iconProps} />;
    case 'Clothing': return <ClothingIcon {...iconProps} />;
    case 'House': return <HouseIcon {...iconProps} />;
    case 'Entertainment': return <EntertainmentIcon {...iconProps} />;
    case 'Health': return <HealthIcon {...iconProps} />;
    case 'ArrowDown': return <ArrowDownIcon {...iconProps} />;
    case 'Tag':
    default:
      return <TagIcon {...iconProps} />;
  }
};

const CategoryModal: React.FC<CategoryModalProps> = ({ 
    isOpen, onClose, categories, onSelectCategory, onAddCategory, onUpdateCategory, onDeleteCategory 
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleUpdate = () => {
    if (editingCategory && editingCategory.name.trim()) {
      onUpdateCategory(editingCategory.id, editingCategory.name.trim());
      setEditingCategory(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Las transacciones existentes no se verán afectadas.')) {
      onDeleteCategory(id);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="category-modal-title" className="text-xl font-bold">Categorías</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 space-y-2 overflow-y-auto">
          {categories.map(cat => (
            <div key={cat.id} className="group flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50">
              {editingCategory?.id === cat.id ? (
                <div className="flex-grow flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-2 py-1 border border-[#008f39] rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-[#008f39]"
                    autoFocus
                  />
                  <button onClick={handleUpdate} className="p-2 text-[#008f39] hover:text-[#007a33] transition-colors">
                    <CheckIcon className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => onSelectCategory && onSelectCategory(cat)}
                  className="flex-grow flex items-center space-x-4 text-left p-2"
                  disabled={!onSelectCategory}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                    <CategoryIcon iconName={cat.icon} color={cat.color} />
                  </div>
                  <span>{cat.name}</span>
                </button>
              )}
              
              <div className="flex items-center space-x-1">
                <button onClick={() => setEditingCategory({ id: cat.id, name: cat.name })} className="p-2 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                  <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nueva categoría..."
              className="flex-grow w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700"
            />
            <button
              onClick={handleAdd}
              aria-label="Añadir nueva categoría"
              className="flex-shrink-0 bg-[#008f39] text-white p-2 rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CategoryModal;
