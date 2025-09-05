import React, { useState, useRef } from 'react';
import { Theme, Category, BankAccount } from '../types';
import ThemeToggle from '../components/ThemeToggle';
import CategoryModal from '../components/CategoryModal';
import BankAccountModal from '../components/BankAccountModal';
import ExportIcon from '../components/icons/ExportIcon';
import ArchiveIcon from '../components/icons/ArchiveIcon';
import ImportIcon from '../components/icons/ImportIcon';

interface AjustesProps {
  theme: Theme;
  onToggleTheme: () => void;
  categories: Category[];
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  bankAccounts: BankAccount[];
  onAddBankAccount: (name: string, color: string) => void;
  onUpdateBankAccount: (id: string, name: string, color: string) => void;
  onDeleteBankAccount: (id: string) => void;
  onExportData: () => void;
  onExportAllDataToJson: () => void;
  onImportDataFromJson: (file: File) => void;
  onManageFixedExpenses: () => void;
}

const Ajustes: React.FC<AjustesProps> = ({ 
    theme, onToggleTheme, 
    categories, onAddCategory, onUpdateCategory, onDeleteCategory,
    bankAccounts, onAddBankAccount, onUpdateBankAccount, onDeleteBankAccount,
    onExportData,
    onExportAllDataToJson,
    onImportDataFromJson,
    onManageFixedExpenses
}) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportDataFromJson(file);
    }
    // Reset file input to allow selecting the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="p-6 bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm dark:border dark:border-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Ajustes
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Apariencia</h3>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="font-medium text-gray-700 dark:text-gray-300">Tema</span>
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Gestión</h3>
            <div className="space-y-2">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full text-left font-medium text-gray-700 dark:text-gray-300"
                >
                  Gestionar Categorías
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                <button
                  onClick={() => setIsBankAccountModalOpen(true)}
                  className="w-full text-left font-medium text-gray-700 dark:text-gray-300"
                >
                  Gestionar Bancos
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                <button
                  onClick={onManageFixedExpenses}
                  className="w-full text-left font-medium text-gray-700 dark:text-gray-300"
                >
                  Gestionar Gastos Fijos
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                <button
                  onClick={onExportData}
                  className="w-full text-left font-medium text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <ExportIcon className="w-5 h-5 mr-3 text-gray-500" />
                  Exportar Perfil Actual (CSV)
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                <button
                  onClick={onExportAllDataToJson}
                  className="w-full text-left font-medium text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <ArchiveIcon className="w-5 h-5 mr-3 text-gray-500" />
                  Exportar Todo (JSON)
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={handleImportClick}
                  className="w-full text-left font-medium text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <ImportIcon className="w-5 h-5 mr-3 text-gray-500" />
                  Importar Todo (JSON)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={onAddCategory}
        onUpdateCategory={onUpdateCategory}
        onDeleteCategory={onDeleteCategory}
      />

      <BankAccountModal
        isOpen={isBankAccountModalOpen}
        onClose={() => setIsBankAccountModalOpen(false)}
        bankAccounts={bankAccounts}
        onAddBankAccount={onAddBankAccount}
        onUpdateBankAccount={onUpdateBankAccount}
        onDeleteBankAccount={onDeleteBankAccount}
      />
    </div>
  );
};

export default Ajustes;